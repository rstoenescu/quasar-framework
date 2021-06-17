// Configuration for your app
const path = require('path')

module.exports = function (ctx) {
  return {
    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    boot: [
      { path: 'gdpr', server: false },
      'components',
      'i18n'
    ],

    css: [
      'app.sass'
    ],

    extras: [
      'roboto-font',
      'material-icons'
    ],

    // preFetch: true,

    build: {
      vueRouterMode: 'history',
      showProgress: ctx.dev,
      distDir: 'dist/quasar.dev',
      // analyze: true,

      chainWebpack (chain) {
        chain.module.rule('eslint')
          .pre()
          .exclude.add(/node_modules|\.md\.js$/).end()
          .test(/\.(js|vue)$/)
          .use('eslint-loader').loader('eslint-loader')

        chain.resolve.alias
          .merge({
            examples: path.resolve(__dirname, 'src/examples'),
            markup: path.resolve(__dirname, 'src/markup')
          })

        chain.module.rule('pug')
          .test(/\.pug$/)
          .use('pug-loader').loader('pug-plain-loader')

        const rule = chain.module.rule('md')
          .test(/\.md$/)

        rule.use('v-loader')
          .loader('vue-loader')
          .options({
            productionMode: ctx.prod,
            compilerOptions: {
              preserveWhitespace: false
            },
            transformAssetUrls: {
              video: 'src',
              source: 'src',
              img: 'src',
              image: 'xlink:href'
            }
          })

        rule.use('md-loader')
          .loader(require.resolve('./build/md-loader'))
      }
    },

    devServer: {
      // https: true,
      port: 9090,
      open: true // opens browser window automatically
    },

    framework: {
      importStrategy: 'all',
      iconSet: 'svg-mdi-v5',

      config: {
        loadingBar: {
          color: 'amber'
        }
      }
    },

    animations: [ 'fadeIn', 'fadeOut' ],

    ssr: {
      pwa: true
    },

    pwa: {
      // workboxPluginMode: 'InjectManifest',
      workboxOptions: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn/,
            handler: 'StaleWhileRevalidate'
          }
        ]
      },
      manifest: {
        name: 'Quasar v1 Docs',
        short_name: 'Quasar v1',
        description: 'Quasar Framework v1 Documentation',
        display: 'standalone',
        orientation: 'any',
        background_color: '#000000',
        theme_color: '#00B4FF',
        icons: [
          {
            src: 'https://cdn.quasar.dev/logo-v2/favicon/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: 'https://cdn.quasar.dev/logo-v2/favicon/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'https://cdn.quasar.dev/logo-v2/favicon/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: 'https://cdn.quasar.dev/logo-v2/favicon/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: 'https://cdn.quasar.dev/logo-v2/favicon/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      metaVariables: {
        appleTouchIcon120: 'https://cdn.quasar.dev/logo-v2/favicon/apple-icon-120x120.png',
        appleTouchIcon180: 'https://cdn.quasar.dev/logo-v2/favicon/apple-icon-180x180.png',
        appleTouchIcon152: 'https://cdn.quasar.dev/logo-v2/favicon/apple-icon-152x152.png',
        appleTouchIcon167: 'https://cdn.quasar.dev/logo-v2/favicon/apple-icon-167x167.png',
        appleSafariPinnedTab: 'https://cdn.quasar.dev/logo-v2/favicon/safari-pinned-tab.svg',
        msapplicationTileImage: 'https://cdn.quasar.dev/logo-v2/favicon/ms-icon-144x144.png'
      }
    },

    vendor: {
      remove: [
        'quasar/dist/api'
      ]
    }
  }
}
