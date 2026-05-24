/**
 * Lista de e-mails autorizados como administradores do sistema.
 * Adicione novos e-mails nesta lista para conceder acesso ao painel administrativo.
 */
export const ADMIN_EMAILS = ['victor.atomo@gmail.com', 'amandateo2709@gmail.com'];

/**
 * Verifica se um e-mail pertence à lista de administradores.
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
