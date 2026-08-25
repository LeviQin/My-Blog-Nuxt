export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  devtools: {
    enabled: true,
  },

  ssr: true,

  css: [
    '~/assets/css/main.css',
    '~/assets/css/journal-home.css',
    '~/assets/css/lab.css',
  ],

  runtimeConfig: {
    // Nuxt Server → 后端 API
    apiBase: 'http://127.0.0.1:3000',

    public: {
      // 对外网站地址
      siteUrl: 'http://localhost:3006',
    },
  },

  app: {
    head: {
      htmlAttrs: {
        lang: 'zh-CN',
      },

      meta: [
        {
          name: 'description',
          content: '记录代码，也记录生活里的风景。',
        },
        {
          name: 'baidu-site-verification',
          content: 'codeva-oJGjZZEAc9',
        },
        {
          name: 'theme-color',
          content: '#f7f2e8',
        },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
      ],
    },
  },
})
