import 'server-only';

/** Modo demo: sin backend ni base de datos; datos deterministas y credenciales fijas. */
export const DEMO_MODE = process.env.SYNTHETICA_DEMO !== 'false';
export const API_URL = process.env.SYNTHETICA_API_URL ?? 'http://localhost:3001/api';
export const SESSION_COOKIE = 'synthetica_session';
export const DEMO_CREDENTIALS = { email: 'demo@synthetica.health', password: 'demo1234' } as const;
