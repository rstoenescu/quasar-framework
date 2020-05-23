const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const WebpackChain = require('webpack-chain')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
const WebpackProgress = require('./plugin.progress')
const BootDefaultExport = require('./plugin.boot-default-export')

const appPaths = require('../app-paths')
const esmCompat = require('../helpers/esm-compat');
const injectStyleRules = require('./inject.style-rules')

module.exports = function (cfg, configName) {
  const chain = new WebpackChain()

  const needsHash = !cfg.ctx.dev && !['electron', 'cordova', 'capacitor', 'bex'].includes(cfg.ctx.modeName)
  const fileHash = needsHash ? '.[contenthash:8]' : ''
  const chunkHash = needsHash ? '.[chunkhash:8]' : ''
  const resolveModules = [
    'node_modules',
    appPaths.resolve.app('node_modules'),
    appPaths.resolve.cli('node_modules')
  ]

  if (configName === 'Capacitor') {
    // need to also look into /src-capacitor
    // for deps like @capacitor/core
    resolveModules.push(
      appPaths.resolve.capacitor('node_modules')
    )
  }

  chain.entry('app').add(appPaths.resolve.app('.quasar/client-entry.js'))
  chain.mode(cfg.ctx.dev ? 'development' : 'production')
  chain.devtool(cfg.build.sourceMap ? cfg.build.devtool : false)

  if (cfg.ctx.prod || cfg.ctx.mode.ssr) {
    chain.output
      .path(
        cfg.ctx.mode.ssr
          ? path.join(cfg.build.distDir, 'www')
          : cfg.build.distDir
      )
      .publicPath(cfg.build.publicPath)
      .filename(`js/[name]${fileHash}.js`)
      .chunkFilename(`js/[name]${chunkHash}.js`)
  }

  chain.resolve.symlinks(false)

  chain.resolve.extensions
    .merge([ '.mjs', '.js', '.vue', '.json' ])

  if (cfg.supportTS === true) {
    chain.resolve.extensions
      .merge([ '.ts' ])
  }

  chain.resolve.modules
    .merge(resolveModules)

  chain.resolve.alias
    .merge({
      src: appPaths.srcDir,
      app: appPaths.appDir,
      components: appPaths.resolve.src(`components`),
      layouts: appPaths.resolve.src(`layouts`),
      pages: appPaths.resolve.src(`pages`),
      assets: appPaths.resolve.src(`assets`),
      boot: appPaths.resolve.src(`boot`),

      'src-bex': appPaths.bexDir // needed for app/templates
    })

  if (cfg.framework.all === true) {
    chain.resolve.alias.set('quasar$', 'quasar/dist/quasar.esm.js')
  }
  if (cfg.build.vueCompiler) {
    chain.resolve.alias.set('vue$', 'vue/dist/vue.esm.js')
  }

  chain.resolveLoader.modules
    .merge(resolveModules)

  chain.module.noParse(
    cfg.framework.all === true
      ? /^(vue|vue-router|vuex|vuex-router-sync|@quasar[\\/]extras|quasar)$/
      : /^(vue|vue-router|vuex|vuex-router-sync|@quasar[\\/]extras)$/
  )

  const vueRule = chain.module.rule('vue')
    .test(/\.vue$/)

  if (cfg.framework.all === 'auto') {
    vueRule.use('quasar-auto-import')
      .loader(path.join(__dirname, 'loader.auto-import.js'))
      .options(cfg.framework.autoImportComponentCase)
  }

  vueRule.use('vue-loader')
    .loader('vue-loader')
    .options({
      productionMode: cfg.ctx.prod,
      compilerOptions: {
        preserveWhitespace: false
      },
      transformAssetUrls: cfg.build.transformAssetUrls
    })

  chain.module.rule('babel')
    .test(/\.jsx?$/)
    .exclude
      .add(filepath => {
        // always transpile js(x) in Vue files
        if (/\.vue\.jsx?$/.test(filepath)) {
          return false
        }

        if (filepath.match(/[\\/]node_modules[\\/]quasar[\\/]/)) {
          if (configName === 'Server') {
            // transpile only if not from 'quasar/dist' folder
            if (!filepath.match(/[\\/]node_modules[\\/]quasar[\\/]dist/)) {
              return false
            }
          }
          else {
            // always transpile Quasar
            return false
          }
        }

        if (cfg.build.transpileDependencies.some(dep => filepath.match(dep))) {
          return false
        }

        // Don't transpile anything else in node_modules
        return /[\\/]node_modules[\\/]/.test(filepath)
      })
      .end()
    .use('babel-loader')
      .loader('babel-loader')
        .options({
          compact: false,
          extends: appPaths.resolve.app(esmCompat('babel.config')),
          plugins: cfg.framework.all !== true && configName !== 'Server' ? [
            [
              'transform-imports', {
                quasar: {
                  transform: `quasar/dist/babel-transforms/imports.js`,
                  preventFullImport: true
                }
              }
            ]
          ] : []
        })

  if (cfg.supportTS !== false) {
    chain.resolve.extensions.add('.ts').add('.tsx')

    chain.module
      .rule('typescript')
      .test(/\.tsx?$/)
      .use('ts-loader')
      .loader('ts-loader')
      .options({
        // custom config is merged if present, but vue setup and type checking disable are always applied
        ...(cfg.supportTS.tsLoaderConfig || {}),
        appendTsSuffixTo: [/\.vue$/],
        // Type checking is handled by fork-ts-checker-webpack-plugin
        transpileOnly: true
      })

    const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
    chain
      .plugin('ts-checker')
      // https://github.com/TypeStrong/fork-ts-checker-webpack-plugin#options
      .use(ForkTsCheckerWebpackPlugin, [
        // custom config is merged if present, but vue option is always enabled
        { ...(cfg.supportTS.tsCheckerConfig || {}), vue: true }
      ])
  }

  chain.module.rule('images')
    .test(/\.(png|jpe?g|gif|svg)(\?.*)?$/)
    .use('url-loader')
      .loader('url-loader')
      .options({
        esModule: false,
        limit: 10000,
        name: `img/[name]${fileHash}.[ext]`
      })

  chain.module.rule('fonts')
    .test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/)
    .use('url-loader')
      .loader('url-loader')
      .options({
        esModule: false,
        limit: 10000,
        name: `fonts/[name]${fileHash}.[ext]`
      })

  chain.module.rule('media')
    .test(/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/)
    .use('url-loader')
      .loader('url-loader')
      .options({
        esModule: false,
        limit: 10000,
        name: `media/[name]${fileHash}.[ext]`
      })

  injectStyleRules(chain, {
    rtl: cfg.build.rtl,
    sourceMap: cfg.build.sourceMap,
    extract: cfg.build.extractCSS,
    serverExtract: configName === 'Server' && cfg.build.extractCSS,
    minify: cfg.build.minify,
    stylusLoaderOptions: cfg.build.stylusLoaderOptions,
    sassLoaderOptions: cfg.build.sassLoaderOptions,
    scssLoaderOptions: cfg.build.scssLoaderOptions,
    lessLoaderOptions: cfg.build.lessLoaderOptions
  })

  chain.module // fixes https://github.com/graphql/graphql-js/issues/1272
    .rule('mjs')
    .test(/\.mjs$/)
    .include
      .add(/node_modules/)
      .end()
    .type('javascript/auto')

  chain.plugin('vue-loader')
    .use(VueLoaderPlugin)

  chain.plugin('define')
    .use(webpack.DefinePlugin, [ cfg.build.env ])

  if (cfg.build.showProgress) {
    chain.plugin('progress')
      .use(WebpackProgress, [{ name: configName }])
  }

  chain.plugin('boot-default-export')
    .use(BootDefaultExport)

  chain.performance
    .hints(false)
    .maxAssetSize(500000)

  if (configName !== 'Server' && cfg.vendor.disable !== true) {
    const { add, remove } = cfg.vendor
    const regex = /[\\/]node_modules[\\/]/

    chain.optimization
      .splitChunks({
        cacheGroups: {
          vendors: {
            name: 'vendor',
            chunks: 'all',
            priority: -10,
            // a module is extracted into the vendor chunk if...
            test: add !== void 0 || remove !== void 0
              ? module => {
                if (module.resource) {
                  if (remove !== void 0 && remove.test(module.resource)) { return false }
                  if (add !== void 0 && add.test(module.resource)) { return true }
                }
                return regex.test(module.resource)
              }
              : module => regex.test(module.resource)
          },
          common: {
            name: `chunk-common`,
            minChunks: 2,
            priority: -20,
            chunks: 'all',
            reuseExistingChunk: true
          }
        }
      })

    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    if (cfg.build.webpackManifest) {
      chain.optimization.runtimeChunk('single')
    }
  }


  // DEVELOPMENT build
  if (cfg.ctx.dev) {
    const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
    const { devCompilationSuccess } = require('../helpers/banner')

    chain.optimization
      .noEmitOnErrors(true)

    chain.plugin('friendly-errors')
      .use(FriendlyErrorsPlugin, [{
        clearConsole: true,
        compilationSuccessInfo: ['spa', 'pwa', 'ssr'].includes(cfg.ctx.modeName)
          ? { notes: [ devCompilationSuccess(cfg.ctx, cfg.build.APP_URL, appPaths.appDir) ] }
          : undefined
      }])
  }
  // PRODUCTION build
  else {
    // keep module.id stable when vendor modules does not change
    chain.plugin('hashed-module-ids')
      .use(webpack.HashedModuleIdsPlugin, [{
        hashDigest: 'hex'
      }])

    if (configName !== 'Server') {
      // copy statics to dist folder
      const CopyWebpackPlugin = require('copy-webpack-plugin')

      const copyArray = []
      const staticsFolder = appPaths.resolve.src('statics')

      if (fs.existsSync(staticsFolder)) {
        copyArray.push({
          from: staticsFolder,
          to: 'statics',
          ignore: ['.*'].concat(
            // avoid useless files to be copied
            ['electron', 'cordova', 'capacitor'].includes(cfg.ctx.modeName)
              ? [ 'icons/*', 'app-logo-128x128.png' ]
              : []
          )
        })
      }

      chain.plugin('copy-webpack')
        .use(CopyWebpackPlugin, [ copyArray ])
    }

    // Scope hoisting ala Rollupjs
    if (cfg.build.scopeHoisting) {
      chain.optimization
        .concatenateModules(true)
    }

    if (cfg.ctx.debug) {
      // reset default webpack 4 minimizer
      chain.optimization.minimizers.delete('js')
      // also:
      chain.optimization.minimize(false)
    }
    else if (cfg.build.minify) {
      const TerserPlugin = require('terser-webpack-plugin')

      chain.optimization
        .minimizer('js')
        .use(TerserPlugin, [{
          terserOptions: cfg.build.uglifyOptions,
          extractComments: false,
          cache: true,
          parallel: true,
          sourceMap: cfg.build.sourceMap
        }])
    }

    // configure CSS extraction & optimize
    if (configName !== 'Server' && cfg.build.extractCSS) {
      const MiniCssExtractPlugin = require('mini-css-extract-plugin')

      // extract css into its own file
      chain.plugin('mini-css-extract')
        .use(MiniCssExtractPlugin, [{
          filename: 'css/[name].[contenthash:8].css'
        }])

      // dedupe & minify CSS (only if extracted)
      if (cfg.build.minify) {
        const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')

        const cssProcessorOptions = {
          parser: require('postcss-safe-parser'),
          autoprefixer: { disable: true }
        }
        if (cfg.build.sourceMap) {
          cssProcessorOptions.map = { inline: false }
        }

        // We are using this plugin so that possible
        // duplicated CSS = require(different components) can be deduped.
        chain.plugin('optimize-css')
          .use(OptimizeCSSPlugin, [{
            canPrint: false,
            cssProcessor: require('cssnano'),
            cssProcessorOptions,
            cssProcessorPluginOptions: {
              preset: ['default', {
                mergeLonghand: false,
                convertValues: false,
                cssDeclarationSorter: false,
                reduceTransforms: false
              }]
            }
          }])
      }
    }

    if (configName !== 'Server') {
      // also produce a gzipped version
      if (cfg.build.gzip) {
        const CompressionWebpackPlugin = require('compression-webpack-plugin')
        chain.plugin('compress-webpack')
          .use(CompressionWebpackPlugin, [ cfg.build.gzip ])
      }

      if (cfg.build.analyze) {
        const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
        chain.plugin('bundle-analyzer')
          .use(BundleAnalyzerPlugin, [ Object.assign({}, cfg.build.analyze) ])
      }
    }
  }

  return chain
}
