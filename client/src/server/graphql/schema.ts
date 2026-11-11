import 'server-only';
import { buildSchema } from 'graphql';

export const typeDefs = /* GraphQL */ `
  enum AppointmentStatus {
    pendiente
    confirmado
    completado
    cancelado
  }

  input DashboardFiltersInput {
    from: String!
    to: String!
    doctor: String
    status: AppointmentStatus
  }

  type DashboardKpis {
    total: Int!
    pendientes: Int!
    confirmados: Int!
    completados: Int!
    cancelados: Int!
    tasaAusentismo: Float!
    ingresos: Float!
  }

  type DailyPoint {
    fecha: String!
    total: Int!
    completados: Int!
    cancelados: Int!
  }

  type SpecialtyPoint {
    especialidad: String!
    total: Int!
    cancelados: Int!
  }

  type Appointment {
    id: Int!
    paciente: String!
    profesional: String!
    especialidad: String!
    fecha: String!
    hora: String!
    estado: AppointmentStatus!
  }

  type Dashboard {
    kpis: DashboardKpis!
    serie: [DailyPoint!]!
    porEspecialidad: [SpecialtyPoint!]!
    turnos(limit: Int = 200): [Appointment!]!
  }

  type Query {
    dashboard(filters: DashboardFiltersInput!): Dashboard!
    doctors: [String!]!
  }
`;

export const schema = buildSchema(typeDefs);
