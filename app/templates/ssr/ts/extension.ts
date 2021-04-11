/*
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 *
 * Note: This file is used for both PRODUCTION & DEVELOPMENT.
 * Note: Changes to this file (but not any file it imports!) are picked up by the
 * development server, but such updates are costly since the dev-server needs a reboot.
 */
import { extendApp } from 'quasar/wrappers'

export const extendApp = extendApp(({ app, ssr }) => {
  /*
    Extend the parts of the express app that you
    want to use with development server too.
    Example: app.use(), app.get() etc
  */
})
