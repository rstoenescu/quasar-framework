import Vue from 'vue'

import QSpinner from '../components/spinner/QSpinner.js'
import { isSSR } from './Platform.js'
import uid from '../utils/uid.js'
import { getCache, cache } from '../utils/vm.js'

let
  vm,
  timeout,
  props = {},
  originalDefaults = {
    delay: 0,
    message: false,
    spinnerSize: 80,
    spinnerColor: 'white',
    messageColor: 'white',
    backgroundColor: 'black',
    spinner: QSpinner,
    customClass: ''
  },
  defaults = { ...originalDefaults }

const Loading = {
  isActive: false,

  show (opts) {
    if (isSSR === true) { return }

    props = opts === Object(opts) && opts.ignoreDefaults === true
      ? { ...originalDefaults, ...opts }
      : { ...defaults, ...opts }

    props.customClass += ` text-${props.backgroundColor}`

    this.isActive = true

    if (vm !== void 0) {
      vm.$forceUpdate()
      return
    }

    clearTimeout(timeout)
    timeout = setTimeout(() => {
      timeout = void 0

      const node = document.createElement('div')
      document.body.appendChild(node)
      document.body.classList.add('q-body--loading')

      vm = new Vue({
        name: 'QLoading',

        el: node,

        render: (h) => {
          return h('transition', {
            props: {
              name: 'q-transition--fade',
              appear: true
            },
            on: getCache(this, 'tr') || cache(this, 'tr', {
              'after-leave': () => {
                // might be called to finalize
                // previous leave, even if it was cancelled
                if (this.isActive !== true && vm !== void 0) {
                  vm.$destroy()
                  document.body.classList.remove('q-body--loading')
                  vm.$el.remove()
                  vm = void 0
                }
              }
            })
          }, [
            this.isActive === true ? h('div', {
              staticClass: 'q-loading fullscreen column flex-center z-max',
              key: uid(),
              class: props.customClass.trim()
            }, [
              h(props.spinner, {
                props: {
                  color: props.spinnerColor,
                  size: props.spinnerSize
                }
              }),
              (props.message && h('div', {
                class: `text-${props.messageColor}`,
                domProps: {
                  [props.sanitize === true ? 'textContent' : 'innerHTML']: props.message
                }
              })) || void 0
            ]) : null
          ])
        }
      })
    }, props.delay)
  },

  hide () {
    if (this.isActive === true) {
      if (timeout !== void 0) {
        clearTimeout(timeout)
        timeout = void 0
      }

      this.isActive = false
    }
  },

  setDefaults (opts) {
    opts === Object(opts) && Object.assign(defaults, opts)
  },

  install ({ $q, cfg: { loading } }) {
    this.setDefaults(loading)
    $q.loading = this
  }
}

Vue.util.defineReactive(Loading, 'isActive', Loading.isActive)

export default Loading
