/**
 * THIS FILE IS GENERATED AUTOMATICALLY.
 * DO NOT EDIT.
 **/

const
  fs = require('fs'),
  path = require('path'),
  LRU = require('lru-cache'),
  { createBundleRenderer } = require('vue-server-renderer')

const
  resolve = file => path.join(__dirname, file),
  template = fs.readFileSync(resolve('template.html'), 'utf-8'),
  bundle = require('./vue-ssr-server-bundle.json'),
  clientManifest = require('./vue-ssr-client-manifest.json')

const settings = <%= opts %>

if (process.env.DEBUG) {
  settings.debug = true
}

const rendererOptions = {
  template,
  clientManifest,
  // for component caching
  cache: new LRU(settings.componentCache),
  basedir: __dirname,
  // recommended for performance
  runInNewContext: false
}

// https://github.com/vuejs/vue/blob/dev/packages/vue-server-renderer/README.md#why-use-bundlerenderer
let renderer = createBundleRenderer(bundle, rendererOptions)

module.exports.renderToString = function ({ req, res }, cb) {
  const ctx = {
    url: req.url,
    req,
    res
  }
<% if (flags.meta) { %>
  renderer.renderToString(ctx, (err, html) => {
    if (err) { cb(err, html) }
    else { cb(err, ctx.$getMetaHTML(html)) }
  })
<% } else { %>
  renderer.renderToString(ctx, cb)
<% } %>
}

module.exports.resolveWWW = function (file) {
  return resolve('www/' + file)
}

module.exports.mergeRendererOptions = function (opts) {
  renderer = createBundleRenderer(
    bundle,
    Object.assign(rendererOptions, opts)
  )
}

module.exports.settings = settings

module.exports.extendApp = async ({ app }) => {
  const extensionJson = require('@quasar/app/lib/app-extension/extension-json'),
    extensions = Object.keys(extensionJson.getList()),
    Extension = require('@quasar/app/lib/app-extension/Extension')
  for (let ext of extensions) {
    const instance = new Extension(ext)
    const hooks = await instance.run({})

    for (const hook of hooks.extendSsr) {
      await hook.fn(hook.api, {
        app
      })
    }
  }
}
