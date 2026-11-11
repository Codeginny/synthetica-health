const Anthropic = require('@anthropic-ai/sdk');
const { getDashboard } = require('./analyticsService');
const { filtersSchema, STATUSES } = require('../validators/schemas');
const { HttpError } = require('../middleware/errorHandler');

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-5-5';
const MAX_TOOL_ROUNDS = 4;

const client = new Anthropic();

// Prompt estable (sin fechas ni datos variables) para que el prefijo sea cacheable.
const SYSTEM = `Sos el asistente analítico de Synthetica Health, un dashboard operativo para clínicas.
Respondés en español neutro, con tono profesional y directo.
Para cualquier cifra, consultá get_dashboard_metrics: nunca inventes ni estimes números.
Interpretá rangos relativos ("semana pasada", "este mes") a partir de la fecha de hoy indicada por el usuario.
Ausentismo = turnos cancelados / total del rango.
Respondé en el formato JSON pedido: un resumen breve, de 2 a 4 highlights con valores ya formateados y, si aporta, una tabla.`;

const TOOLS = [
  {
    name: 'get_dashboard_metrics',
    description:
      'Devuelve KPIs, serie diaria, totales por especialidad y hasta 200 turnos para un rango de fechas, con filtros opcionales por profesional y estado.',
    strict: true,
    input_schema: {
      type: 'object',
      properties: {
        from: { type: 'string', description: 'Fecha inicial YYYY-MM-DD' },
        to: { type: 'string', description: 'Fecha final YYYY-MM-DD (inclusive)' },
        doctor: { type: ['string', 'null'], description: 'Nombre exacto del profesional o null' },
        status: { type: ['string', 'null'], enum: [...STATUSES, null] },
      },
      required: ['from', 'to', 'doctor', 'status'],
      additionalProperties: false,
    },
  },
];

const ANSWER_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    highlights: {
      type: 'array',
      items: {
        type: 'object',
        properties: { label: { type: 'string' }, value: { type: 'string' } },
        required: ['label', 'value'],
        additionalProperties: false,
      },
    },
    table: {
      anyOf: [
        {
          type: 'object',
          properties: {
            columns: { type: 'array', items: { type: 'string' } },
            rows: { type: 'array', items: { type: 'array', items: { type: ['string', 'number'] } } },
          },
          required: ['columns', 'rows'],
          additionalProperties: false,
        },
        { type: 'null' },
      ],
    },
  },
  required: ['summary', 'highlights', 'table'],
  additionalProperties: false,
};

async function runTool(block) {
  const parsed = filtersSchema.safeParse(block.input);
  if (!parsed.success) {
    return { type: 'tool_result', tool_use_id: block.id, is_error: true, content: parsed.error.message };
  }
  const data = await getDashboard(parsed.data);
  // Se recortan filas para no inflar el contexto: KPIs y agregados alcanzan para casi todas las preguntas.
  return { type: 'tool_result', tool_use_id: block.id, content: JSON.stringify({ ...data, turnos: data.turnos.slice(0, 50) }) };
}

/**
 * Contrato: POST /api/assistant/query { question, filters } → AssistantAnswer.
 * Loop manual de tool use; la respuesta final llega como JSON validado por structured outputs.
 */
async function ask({ question, filters }) {
  const today = new Date().toISOString().slice(0, 10);
  const messages = [
    {
      role: 'user',
      content: `Hoy es ${today}. Filtros activos en el dashboard: ${JSON.stringify(filters)}.\n\nPregunta: ${question}`,
    },
  ];

  for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
    let response;
    try {
      response = await client.beta.messages.create({
        model: MODEL,
        max_tokens: 16000,
        system: SYSTEM,
        tools: TOOLS,
        messages,
        cache_control: { type: 'ephemeral' },
        output_config: { effort: 'medium', format: { type: 'json_schema', schema: ANSWER_SCHEMA } },
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
      });
    } catch (err) {
      if (err instanceof Anthropic.RateLimitError) throw new HttpError(429, 'El asistente está saturado, probá en unos segundos');
      if (err instanceof Anthropic.AuthenticationError) throw new HttpError(503, 'Asistente analítico no configurado');
      if (err instanceof Anthropic.APIConnectionError) throw new HttpError(503, 'Sin conexión con el servicio del asistente');
      throw err;
    }

    if (response.stop_reason === 'refusal') throw new HttpError(422, 'El asistente no puede responder esa consulta');

    if (response.stop_reason === 'tool_use') {
      messages.push({ role: 'assistant', content: response.content });
      const toolUses = response.content.filter((b) => b.type === 'tool_use');
      messages.push({ role: 'user', content: await Promise.all(toolUses.map(runTool)) });
      continue;
    }

    const text = response.content.find((b) => b.type === 'text')?.text;
    if (!text) throw new HttpError(502, 'Respuesta vacía del asistente');
    return JSON.parse(text);
  }

  throw new HttpError(504, 'El asistente excedió el máximo de consultas');
}

module.exports = { ask };
