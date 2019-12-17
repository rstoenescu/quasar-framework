const fs = require('fs')
const { green } = require('chalk')

const appPaths = require('./app-paths')

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
  if (content.indexOf(cfg.sourceFiles.rootId || 'q-app') === -1) {
    console.log(`\n ⚠️  Quasar requires a minor change to the root component:
   ${file}

  Please add: id="${cfg.sourceFiles.rootId || 'q-app'}" (or write ${cfg.sourceFiles.rootId ? "#"+cfg.sourceFiles.rootId : "#q-app"} if using Pug)
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

  file = appPaths.resolve.app('babel.config.js')
  if (!fs.existsSync(file)) {
    console.log(' ⚠️  Missing babel.config.js file...')
    console.log()
    process.exit(1)
  }
}
