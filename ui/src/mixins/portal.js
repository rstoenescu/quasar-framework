import Vue from 'vue'

import { isSSR } from '../plugins/Platform.js'
import { getBodyFullscreenElement } from '../utils/dom.js'
import { FOCUSABLE_SELECTOR, changeFocusedElement } from '../utils/focus'

export function closePortalMenus (vm, evt) {
  do {
    if (vm.$options.name === 'QMenu') {
      vm.hide(evt)

      // is this a point of separation?
      if (vm.separateClosePopup === true) {
        return vm.$parent
      }
    }
    else if (vm.__renderPortal !== void 0) {
      // treat it as point of separation if parent is QPopupProxy
      // (so mobile matches desktop behavior)
      // and hide it too
      if (vm.$parent !== void 0 && vm.$parent.$options.name === 'QPopupProxy') {
        vm.hide(evt)
        return vm.$parent
      }
      else {
        return vm
      }
    }
    vm = vm.$parent
  } while (
    vm !== void 0 && (
      vm.$el.contains === void 0 || // IE polyfill does not work on comments
      vm.$el.contains(evt.target) !== true
    )
  )
}

export function closePortals (vm, evt, depth) {
  while (depth !== 0 && vm !== void 0) {
    if (vm.__renderPortal !== void 0) {
      depth--

      if (vm.$options.name === 'QMenu') {
        vm = closePortalMenus(vm, evt)
        continue
      }

      vm.hide(evt)
    }

    vm = vm.$parent
  }
}

function isOnGlobalDialog (vm) {
  while (vm !== void 0) {
    if (vm.$options.name === 'QGlobalDialog') {
      return true
    }
    if (vm.$options.name === 'QDialog') {
      return false
    }

    vm = vm.$parent
  }
  return false
}

const Portal = {
  inheritAttrs: false,

  props: {
    contentClass: [ Array, String, Object ],
    contentStyle: [ Array, String, Object ]
  },

  methods: {
    focus () {
      const node = this.__getInnerNode()

      if (node !== void 0 && node.contains(document.activeElement) !== true) {
        const autofocusNode = node.querySelector('[autofocus], [data-autofocus]')

        if (autofocusNode !== null && typeof autofocusNode.focus === 'function') {
          autofocusNode.focus()
        }
        else {
          const focusableElements = Array.prototype.slice.call(node.querySelectorAll(FOCUSABLE_SELECTOR))
          focusableElements.length > 0 && changeFocusedElement(
            focusableElements,
            focusableElements[0].classList.contains('q-key-group-navigation--ignore-focus') === true ? 1 : 0,
            1
          )
        }
      }
    },

    __showPortal () {
      if (this.$q.fullscreen !== void 0 && this.$q.fullscreen.isCapable === true) {
        const append = isFullscreen => {
          if (this.__portal === void 0) {
            return
          }

          const newParent = getBodyFullscreenElement(
            isFullscreen,
            this.$q.fullscreen.activeEl
          )

          if (
            this.__portal.$el.parentElement !== newParent &&
            newParent.contains(this.$el) === (this.__onGlobalDialog === false)
          ) {
            newParent.appendChild(this.__portal.$el)
          }
        }

        this.unwatchFullscreen = this.$watch('$q.fullscreen.isActive', append)

        const isActive = this.$q.fullscreen.isActive

        if (this.__onGlobalDialog === false || isActive === true) {
          append(isActive)
        }
      }
      else if (this.__portal !== void 0 && this.__onGlobalDialog === false) {
        document.body.appendChild(this.__portal.$el)
      }
    },

    __hidePortal () {
      if (this.__portal !== void 0) {
        if (this.unwatchFullscreen !== void 0) {
          this.unwatchFullscreen()
          this.unwatchFullscreen = void 0
        }

        if (this.__onGlobalDialog === false) {
          this.__portal.$destroy()
          this.__portal.$el.remove()
        }

        this.__portal = void 0
      }
    },

    __preparePortal () {
      if (this.__portal === void 0) {
        this.__portal = this.__onGlobalDialog === true
          ? {
            $el: this.$el,
            $refs: this.$refs
          }
          : new Vue({
            name: 'QPortal',
            parent: this,

            inheritAttrs: false,

            render: h => this.__renderPortal(h),

            components: this.$options.components,
            directives: this.$options.directives
          }).$mount()
      }
    },

    __getInnerNode () {
      return this.__portal !== void 0 && this.__portal.$refs !== void 0
        ? this.__portal.$refs.inner
        : void 0
    }
  },

  render (h) {
    if (this.__onGlobalDialog === true) {
      return this.__renderPortal(h)
    }

    if (this.__portal !== void 0) {
      this.__portal.$forceUpdate()
    }
  },

  beforeDestroy () {
    this.__hidePortal()
  }
}

if (isSSR === false) {
  Portal.created = function () {
    this.__onGlobalDialog = isOnGlobalDialog(this.$parent)
  }
}

export default Portal
