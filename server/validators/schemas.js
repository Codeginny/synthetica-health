const { z } = require('zod');

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD');
const STATUSES = ['pendiente', 'confirmado', 'completado', 'cancelado'];

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const filtersSchema = z
  .object({
    from: isoDate,
    to: isoDate,
    doctor: z.string().max(100).nullish().transform((v) => v || null),
    status: z.enum(STATUSES).nullish().transform((v) => v || null),
  })
  .refine((f) => f.from <= f.to, { message: '"from" debe ser <= "to"', path: ['from'] });

const assistantQuerySchema = z.object({
  question: z.string().trim().min(3).max(500),
  filters: filtersSchema,
});

module.exports = { STATUSES, loginSchema, filtersSchema, assistantQuerySchema };
