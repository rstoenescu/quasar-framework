const
  webpack = require('webpack'),
  WebpackDevServer = require('webpack-dev-server')

const
  appPaths = require('./app-paths'),
  logger = require('./helpers/logger')
  log = logger('app:dev-server'),
  warn = logger('app:dev-server', 'red')

let alreadyNotified = false

function openBrowser (url, opts) {
  const open = require('open')

  const openDefault = () => {
    log('Opening default browser at ' + url)
    log()
    open(url, { wait: true }).catch(() => {
      warn(`⚠️  Failed to open default browser`)
      warn()
    })
  }

  if (opts) {
    log('Opening browser at ' + url + ' with options: ' + opts)
    log()
    open(url, { app: opts, wait: true }).catch(() => {
      warn(`⚠️  Failed to open specific browser`)
      warn()
      openDefault()
    })
  }
  else {
    openDefault()
  }
}

module.exports = class DevServer {
  constructor (quasarConfig) {
    this.quasarConfig = quasarConfig
  }

  async listen () {
    const
      webpackConfig = this.quasarConfig.getWebpackConfig(),
      cfg = this.quasarConfig.getBuildConfig()

    log(`Booting up...`)
    log()

    return new Promise(resolve => (
      cfg.ctx.mode.ssr
        ? this.listenSSR(webpackConfig, cfg, resolve)
        : this.listenCSR(webpackConfig, cfg, resolve)
    ))
  }

  listenCSR (webpackConfig, cfg, resolve) {
    const compiler = webpack(webpackConfig.renderer || webpackConfig)

    compiler.hooks.done.tap('done-compiling', compiler => {
      if (this.__started) { return }

      // start dev server if there are no errors
      if (compiler.compilation.errors && compiler.compilation.errors.length > 0) {
        return
      }

      this.__started = true

      server.listen(cfg.devServer.port, cfg.devServer.host, () => {
        resolve()

        if (alreadyNotified) { return }
        alreadyNotified = true

        if (cfg.__devServer.open && ['spa', 'pwa'].includes(cfg.ctx.modeName)) {
          openBrowser(cfg.build.APP_URL, cfg.__devServer.openOptions)
        }
      })
    })

    // start building & launch server
    const server = new WebpackDevServer(compiler, cfg.devServer)

    this.__cleanup = () => {
      this.__cleanup = null
      return new Promise(resolve => {
        server.close(resolve)
      })
    }
  }

  listenSSR (webpackConfig, cfg, resolve) {
    const
      fs = require('fs'),
      LRU = require('lru-cache'),
      express = require('express'),
      chokidar = require('chokidar'),
      { createBundleRenderer } = require('vue-server-renderer'),
      ouchInstance = require('./helpers/cli-error-handling').getOuchInstance(),
      SsrExtension = require('./ssr/ssr-extension')

    let renderer

    function createRenderer (bundle, options) {
      // https://github.com/vuejs/vue/blob/dev/packages/vue-server-renderer/README.md#why-use-bundlerenderer
      return createBundleRenderer(bundle, {
        ...options,

        // for component caching
        cache: new LRU({
          max: 1000,
          maxAge: 1000 * 60 * 15
        }),
        // recommended for performance
        runInNewContext: false
      })
    }

    function render (req, res) {
      const startTime = Date.now()

      res.setHeader('Content-Type', 'text/html')

      const handleError = err => {
        if (err.url) {
          res.redirect(err.url)
        }
        else if (err.code === 404) {
          res.status(404).send('404 | Page Not Found')
        }
        else {
          ouchInstance.handleException(err, req, res, output => {
            console.error(`${req.url} -> error during render`)
            console.error(err.stack)
          })
        }
      }

      const context = {
        url: req.url,
        req,
        res
      }

      renderer.renderToString(context, (err, html) => {
        if (err) {
          handleError(err)
          return
        }
        if (cfg.__meta) {
          html = context.$getMetaHTML(html)
        }
        console.log(`${req.url} -> request took: ${Date.now() - startTime}ms`)
        res.send(html)
      })
    }

    let
      bundle,
      template,
      clientManifest,
      pwa

    let ready
    const readyPromise = new Promise(r => { ready = r })
    function update () {
      if (bundle && clientManifest) {
        renderer = createRenderer(bundle, {
          template,
          clientManifest,
          basedir: appPaths.resolve.app('.')
        })
        ready()
      }
    }

    // read template from disk and watch
    const
      { getIndexHtml } = require('./ssr/html-template'),
      templatePath = appPaths.resolve.app(cfg.sourceFiles.indexHtmlTemplate)

    function getTemplate () {
      return getIndexHtml(fs.readFileSync(templatePath, 'utf-8'), cfg)
    }

    template = getTemplate()
    const htmlWatcher = chokidar.watch(templatePath).on('change', () => {
      template = getTemplate()
      console.log('index.template.html template updated.')
      update()
    })

    const
      serverCompiler = webpack(webpackConfig.server),
      clientCompiler = webpack(webpackConfig.client)

    serverCompiler.hooks.done.tapAsync('done-compiling', ({ compilation: { errors, warnings, assets }}, cb) => {
      errors.forEach(err => console.error(err))
      warnings.forEach(err => console.warn(err))

      if (errors.length > 0) {
        cb()
        return
      }

      bundle = JSON.parse(assets['../vue-ssr-server-bundle.json'].source())
      update()

      cb()
    })

    clientCompiler.hooks.done.tapAsync('done-compiling', ({ compilation: { errors, warnings, assets }}, cb) => {
      errors.forEach(err => console.error(err))
      warnings.forEach(err => console.warn(err))

      if (errors.length > 0) {
        cb()
        return
      }

      if (cfg.ctx.mode.pwa) {
        pwa = {
          manifest: assets['manifest.json'].source(),
          serviceWorker: assets['service-worker.js'].source()
        }
      }

      clientManifest = JSON.parse(assets['../vue-ssr-client-manifest.json'].source())
      update()

      cb()
    })

    const serverCompilerWatcher = serverCompiler.watch({}, () => {})

    // start building & launch server
    const server = new WebpackDevServer(clientCompiler, {
      after: async app => {
        if (cfg.ctx.mode.pwa) {
          app.use('/manifest.json', (req, res) => {
            res.setHeader('Content-Type', 'application/json')
            res.send(pwa.manifest)
          })
          app.use('/service-worker.js', (req, res) => {
            res.setHeader('Content-Type', 'text/javascript')
            res.send(pwa.serviceWorker)
          })
        }

        app.use('/statics', express.static(appPaths.resolve.src('statics'), {
          maxAge: 0
        }))

        const extensionJson = require('../lib/app-extension/extension-json'),
          extensions = Object.keys(extensionJson.getList()),
          Extension = require('../lib/app-extension/Extension')
        for (let ext of extensions) {
          const instance = new Extension(ext)
          const hooks = await instance.run({})

          for (const hook of hooks.extendSsr) {
            log(`Extension(${hook.api.extId}): Running extendSsr hook...`)
            await hook.fn(hook.api, { app })
          }
        }

        SsrExtension.getModule().extendApp({ app })

        app.get('*', render)
      },

      ...cfg.devServer
    })

    readyPromise.then(() => {
      server.listen(cfg.devServer.port, cfg.devServer.host, () => {
        resolve()
        if (cfg.__devServer.open) {
          openBrowser(cfg.build.APP_URL, cfg.__devServer.openOptions)
        }
      })
    })

    this.__cleanup = () => {
      this.__cleanup = null
      htmlWatcher.close()
      return Promise.all([
        new Promise(resolve => { server.close(resolve) }),
        new Promise(resolve => { serverCompilerWatcher.close(resolve) })
      ])
    }
  }

  stop () {
    if (this.__cleanup) {
      log(`Shutting down`)
      return this.__cleanup()
    }
  }
}
