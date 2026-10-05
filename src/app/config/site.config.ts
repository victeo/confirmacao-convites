/**
 * Configuração do seu evento.
 *
 * Este é o ÚNICO arquivo de texto que você precisa editar para personalizar o site.
 * Informações de local/endereço são editadas pelo painel administrativo (ficam no Firestore).
 */
export const SITE_CONFIG = {
  /** Título exibido no topo da página e na aba do navegador. */
  title: 'Meu Evento',
  /** Texto exibido no rodapé e no menu lateral. */
  footer: 'Com carinho • 2026',
  /** Chamada principal do card de confirmação. */
  heroTitle: 'Sua presença tornará esse sonho real',
  heroSubtitle: 'Por favor, confirme sua presença para celebrarmos este momento inesquecível.',
  /** Imagem de fundo da página inicial (URL pública ou caminho em /public). */
  heroImage:
    'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1600&q=80',
} as const;
