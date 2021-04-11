// Functions in this file are no-op,
//  they just take a callback function and return it
// They're used to apply typings to the callback
//  parameters and return value when using Quasar with TypeScript
// We need these in `ui` folder to make `quasar/wrapper` import work,
//  but they are useful only for Quasar CLI projects
// They are typed via module augmentation by `@quasar/app`

module.exports.boot = function (callback) {
  return callback
}

module.exports.configure = function (callback) {
  return callback
}

module.exports.preFetch = function (callback) {
  return callback
}

module.exports.route = function (callback) {
  return callback
}

module.exports.store = function (callback) {
  return callback
}

module.exports.extendApp = function (callback) {
  return callback
}
