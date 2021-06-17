import Vue from 'vue'

import { isSSR, fromSSR } from './Platform.js'
import { noop } from '../utils/event.js'

const Dark = {
  isActive: null,
  mode: false,

  install ($q, queues, { dark }) {
    this.isActive = dark === 'auto' ? null : dark === true

    if (isSSR === true) {
      queues.server.push((q, ctx) => {
        q.dark = {
          isActive: null,
          mode: false,
          set: val => {
            ctx.ssr.Q_BODY_CLASSES = ctx.ssr.Q_BODY_CLASSES
              .replace(' body--light', '')
              .replace(' body--dark-auto', '')
              .replace(' body--dark', '') +
              ` body--${val === true ? 'dark' : (val === 'auto' ? 'dark-auto' : 'light')}`

            q.dark.isActive = val === 'auto' ? null : val === true
            q.dark.mode = val
          },
          toggle: () => {
            q.dark.set(q.dark.isActive === false)
          }
        }

        q.dark.set(dark)
      })

      this.set = noop
      return
    }

    const initialVal = dark !== void 0
      ? dark
      : false

    if (fromSSR === true) {
      const ssrSet = val => {
        this.__fromSSR = val
      }

      const originalSet = this.set

      this.set = ssrSet
      ssrSet(initialVal)

      queues.takeover.push(() => {
        document.body.classList.remove('body--dark-auto')
        this.set = originalSet
        this.set(this.__fromSSR)
      })
    }
    else {
      this.set(initialVal)
    }

    Vue.util.defineReactive(this, 'isActive', this.isActive)
    Vue.util.defineReactive($q, 'dark', this)
  },

  set (val) {
    this.mode = val

    if (val === 'auto') {
      if (this.__media === void 0) {
        this.__media = window.matchMedia('(prefers-color-scheme: dark)')
        this.__updateMedia = () => { this.set('auto') }
        this.__media.addListener(this.__updateMedia)
      }

      val = this.__media.matches
    }
    else if (this.__media !== void 0) {
      this.__media.removeListener(this.__updateMedia)
      this.__media = void 0
    }

    this.isActive = val === true

    document.body.classList.remove(`body--${val === true ? 'light' : 'dark'}`)
    document.body.classList.add(`body--${val === true ? 'dark' : 'light'}`)
  },

  toggle () {
    Dark.set(Dark.isActive === false)
  },

  __media: void 0
}

export default Dark
