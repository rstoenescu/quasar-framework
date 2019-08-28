/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 *
 * All content of this folder will be copied as is to the output folder. So only import:
 *  1. node_modules (and yarn/npm install dependencies -- NOT to devDependecies though)
 *  2. create files in this folder and import only those with the relative path
 *
 * Note: This file is used only for PRODUCTION. It is not picked up while in dev mode.
 *   If you are looking to add common DEV & PROD logic to the express app, then use
 *   "src-ssr/extension.js"
 */

const
  express = require('express'),
  compression = require('compression')

const
  ssr = require('../ssr'),
  extension = require('./extension'),
  app = express(),
  port = process.env.PORT || 3000

const serve = (path, cache) => express.static(ssr.resolveWWW(path), {
  maxAge: cache ? 1000 * 60 * 60 * 24 * 30 : 0
})

// gzip
app.use(compression({ threshold: 0 }))

// serve this with no cache, if built with PWA:
if (ssr.settings.pwa) {
  app.use('/service-worker.js', serve('service-worker.js'))
}

// serve "www" folder
app.use('/', serve('.', true))

ssr.extendApp({ app })

// we extend the custom common dev & prod parts here
extension.extendApp({ app })

// this should be last get(), rendering with SSR
app.get('*', (req, res) => {
  res.setHeader('Content-Type', 'text/html')

  // SECURITY HEADERS
  // read more about headers here: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers
  // the following headers help protect your site from common XSS attacks in browsers that respect headers
  // you will probably want to use .env variables to drop in appropriate URLs below,
  // and potentially look here for inspiration:
  // https://ponyfoo.com/articles/content-security-policy-in-express-apps

  // https://developer.mozilla.org/en-us/docs/Web/HTTP/Headers/X-Frame-Options
  // res.setHeader('X-frame-options', 'SAMEORIGIN') // one of DENY | SAMEORIGIN | ALLOW-FROM https://example.com

  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection
  // res.setHeader('X-XSS-Protection', 1)

  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
  // res.setHeader('X-Content-Type-Options', 'nosniff')

  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin
  // res.setHeader('Access-Control-Allow-Origin', '*') // one of '*', '<origin>' where origin is one SINGLE origin

  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-DNS-Prefetch-Control
  // res.setHeader('X-DNS-Prefetch-Control', 'off') // may be slower, but stops some leaks

  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy
  // res.setHeader('Content-Security-Policy', 'default-src https:')

  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/sandbox
  // res.setHeader('Content-Security-Policy', 'sandbox') // this will lockdown your server!!!
  // here are a few that you might like to consider adding to your CSP
  // object-src, media-src, script-src, frame-src, unsafe-inline

  ssr.renderToString({ req, res }, (err, html) => {
    if (err) {
      if (err.url) {
        res.redirect(err.url)
      }
      else if (err.code === 404) {
        res.status(404).send('404 | Page Not Found')
      }
      else {
        // Render Error Page or Redirect
        res.status(500).send('500 | Internal Server Error')
        if (ssr.settings.debug) {
          console.error(`500 on ${req.url}`)
          console.error(err)
          console.error(err.stack)
        }
      }
    }
    else {
      res.send(html)
    }
  })
})

app.listen(port, () => {
  console.log(`Server listening at port ${port}`)
})
