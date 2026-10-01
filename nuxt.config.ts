export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    openaiApiKey: '',
    openaiModel: 'gpt-4o-mini',
    databasePath: 'server/data/perfil.sqlite',
    appEnv: 'production',
    public: { appEnv: 'production' },
  },
  typescript: { strict: true, typeCheck: true },
  app: {
    head: {
      title: 'Pista! — Jogo de dicas',
      meta: [{ name: 'description', content: 'Pista! é um jogo brasileiro para descobrir respostas a partir de dicas.' }],
      link: [{ rel: 'icon', type: 'image/png', href: '/pista-brand.png' }],
    },
  },
})
