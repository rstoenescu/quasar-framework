/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 *
 * Note: This file is used for both PRODUCTION & DEVELOPMENT.
 * Note: Changes to this file (but not any file it imports!) are picked up by the
 * development server, but such updates are costly since the dev-server needs a reboot.
 */

const { extendApp } = require('quasar/wrappers')

module.exports.extendApp = extendApp(({ app, ssr }) => {
  /*
    Extend the parts of the express app that you
    want to use with development server too.
    Example: app.use(), app.get() etc
  */
})