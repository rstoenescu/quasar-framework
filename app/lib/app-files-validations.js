const fs = require('fs')
const { green } = require('chalk')

const appPaths = require('./app-paths')
const esmCompat = require('./helpers/esm-compat')

module.exports = function (cfg) {
  let file
  let content
  let error = false

  file = appPaths.resolve.app(cfg.sourceFiles.indexHtmlTemplate)
  if (!fs.existsSync(file)) {
    console.log(' ⚠️  Missing /src/index.template.html file...')
    console.log()
    error = true
  }
  content = fs.readFileSync(file, 'utf-8')

  if (content.indexOf('<base href') > -1) {
    console.log(` ⚠️  Please remove the tag below from /src/index.template.html
   This is taken care of by Quasar automatically.
  <base href="<%= htmlWebpackPlugin.options.appBase %>">
  `)
    console.log()
    error = true
  }

  // backward compatibility
  const viewPort = '<% if (htmlWebpackPlugin.options.ctx.mode.cordova) { %>, viewport-fit=cover<% } %>'
  if (content.indexOf(viewPort) > -1) {
    content = content.replace(
      viewPort,
      '<% if (htmlWebpackPlugin.options.ctx.mode.cordova || htmlWebpackPlugin.options.ctx.mode.capacitor) { %>, viewport-fit=cover<% } %>'
    )
    fs.writeFileSync(file, content, 'utf-8')
    console.log(`\n ⚠️  Updated viewport-fit in /src/index.template.html to latest Quasar specs`)
    console.log()
  }

  file = appPaths.resolve.app(cfg.sourceFiles.rootComponent)
  content = fs.readFileSync(file, 'utf-8')
  if (content.indexOf('q-app') === -1) {
    console.log(`\n ⚠️  Quasar requires a minor change to the root component:
   ${file}

  Please add: id="q-app" (or write #q-app if using Pug)
  to the outermost HTML element of the template.

${green('Example:')}
  <template>
    <div id="q-app">
      ...
    </div>
  </template>
`)
    error = true
  }

  if (error) {
    process.exit(1)
  }

  const babelConfigFilename = esmCompat('babel.config');
  file = appPaths.resolve.app(babelConfigFilename)
  if (!fs.existsSync(file)) {
    console.log(` ⚠️  Missing ${babelConfigFilename} file...`)
    console.log()
    process.exit(1)
  }
}
