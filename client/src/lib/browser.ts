/** Navegación completa: garantiza que el servidor reciba la cookie recién emitida (aislado para tests). */
export const hardNavigate = (href: string): void => window.location.assign(href);
