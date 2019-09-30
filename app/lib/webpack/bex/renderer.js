const
  path = require('path'),
  fse = require('fs-extra')

const
  appPaths = require('../../app-paths'),
  artifacts = require('../../artifacts')

  /**
 * Copies a file from the BEX template folder into the bexSrc dir.
 * Warning: Will overwrite whatever is there!
 * @param fileName
 */
const renderFile = function (fileName) {
  fse.copySync(path.join(appPaths.cliDir, 'templates', 'bex', 'js', 'core', fileName), path.join(appPaths.resolve.bex('js/core'), fileName))
}

module.exports = function (chain, cfg) {
  const
    rootPath = cfg.ctx.dev ? appPaths.bexDir : cfg.build.distDir,
    outputPath = path.join(rootPath, 'www')

  // Add a copy config to copy the static folder for both dev and build.
  let copyArray = [{
    from: path.join(appPaths.srcDir, 'statics'),
    to: path.join(outputPath, 'statics')
  }]

  // Make sure we always have the latest BEX files in the src-bex folder (to get bug fixes etc)
  // These files are marked with DO NOT EDIT so the users have been warned.
  renderFile(path.join('background', 'background.js'))
  renderFile(path.join('content', 'contentScript.js'))
  renderFile(path.join('init', 'connect.js'))
  renderFile(path.join('init', 'index.js'))
  renderFile('bridge.js')

  chain.output
    .path(outputPath) // Output to our src-bex/www folder or dist/bex/unpacked/www.

  // Bundle our bex files for inclusion via the manifest.json
  chain.entry('bex-init')
    .add(appPaths.resolve.bex('js/core/init/index.js'))

  if (cfg.ctx.dev) {
    // Clean old dir
    artifacts.clean(outputPath)

    // Extensions need to be manually added to the browser
    // so we need the dev files available for them to be targeted.
    const WriteFilePlugin = require('write-file-webpack-plugin')
    chain.plugin('write-file-webpack-plugin')
      .use(WriteFilePlugin)
  }
  else {
    // We need this bundled in with the rest of the source to match the manifest instructions.
    // Could use Webpack Copy here but this is more straight forward.
    cfg.build.htmlFilename = path.join('www', 'index.html')

    // Register our plugin, update the manifest and package the browser extension.
    const WebpackBexPackager = require('./webpackBexPackager')
    chain.plugin('webpack-bex-packager')
      .use(WebpackBexPackager, [{
        src: cfg.bex.builder.directories.input,
        dest: cfg.bex.builder.directories.output,
        name: require(path.join(appPaths.appDir, 'package.json')).name
      }])

    // Copy our user edited BEX files to the dist dir (excluding the already build www folder)
    copyArray.push({
      from: appPaths.bexDir,
      to: cfg.build.distDir,
      ignore: ['www/**/*']
    })
  }

  // Copy any files we've registered during the chain.
  const CopyWebpackPlugin = require('copy-webpack-plugin')
  chain.plugin('copy-webpack')
    .use(CopyWebpackPlugin, [copyArray])
}
