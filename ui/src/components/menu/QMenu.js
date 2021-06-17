import Vue from 'vue'

import AnchorMixin from '../../mixins/anchor.js'
import ModelToggleMixin from '../../mixins/model-toggle.js'
import DarkMixin from '../../mixins/dark.js'
import PortalMixin, { closePortalMenus } from '../../mixins/portal.js'
import TransitionMixin from '../../mixins/transition.js'
import AttrsMixin from '../../mixins/attrs.js'

import ClickOutside from './ClickOutside.js'
import { getScrollTarget } from '../../utils/scroll.js'
import { create, stop, position, stopAndPreventClick } from '../../utils/event.js'
import EscapeKey from '../../utils/escape-key.js'

import { slot } from '../../utils/slot.js'
import { addFocusFn } from '../../utils/focus-manager.js'

import {
  validatePosition, validateOffset, setPosition, parsePosition
} from '../../utils/position-engine.js'

export default Vue.extend({
  name: 'QMenu',

  mixins: [
    AttrsMixin,
    DarkMixin,
    AnchorMixin,
    ModelToggleMixin,
    PortalMixin,
    TransitionMixin
  ],

  directives: {
    ClickOutside
  },

  props: {
    persistent: Boolean,
    autoClose: Boolean,
    separateClosePopup: Boolean,

    noRouteDismiss: Boolean,
    noRefocus: Boolean,
    noFocus: Boolean,

    fit: Boolean,
    cover: Boolean,

    square: Boolean,

    anchor: {
      type: String,
      validator: validatePosition
    },
    self: {
      type: String,
      validator: validatePosition
    },
    offset: {
      type: Array,
      validator: validateOffset
    },

    scrollTarget: {
      default: void 0
    },

    touchPosition: Boolean,

    maxHeight: {
      type: String,
      default: null
    },
    maxWidth: {
      type: String,
      default: null
    }
  },

  computed: {
    anchorOrigin () {
      return parsePosition(
        this.anchor || (
          this.cover === true ? 'center middle' : 'bottom start'
        ),
        this.$q.lang.rtl
      )
    },

    selfOrigin () {
      return this.cover === true
        ? this.anchorOrigin
        : parsePosition(this.self || 'top start', this.$q.lang.rtl)
    },

    menuClass () {
      return (this.square === true ? ' q-menu--square' : '') +
        ` q-menu--${this.darkSuffix} q-${this.darkSuffix}`
    },

    hideOnRouteChange () {
      return this.persistent !== true &&
        this.noRouteDismiss !== true
    },

    onEvents () {
      const on = {
        ...this.qListeners,
        // stop propagating these events from children
        input: stop,
        'popup-show': stop,
        'popup-hide': stop
      }

      if (this.autoClose === true) {
        on.click = this.__onAutoClose
      }

      return on
    },

    attrs () {
      return {
        tabindex: -1,
        ...this.qAttrs
      }
    }
  },

  methods: {
    focus () {
      addFocusFn(() => {
        let node = this.__portal !== void 0 && this.__portal.$refs !== void 0
          ? this.__portal.$refs.inner
          : void 0

        if (node !== void 0 && node.contains(document.activeElement) !== true) {
          node = node.querySelector('[autofocus], [data-autofocus]') || node
          node.focus()
        }
      })
    },

    __show (evt) {
      // IE can have null document.activeElement
      this.__refocusTarget = this.noRefocus === false && document.activeElement !== null
        ? document.activeElement
        : void 0

      EscapeKey.register(this, () => {
        if (this.persistent !== true) {
          this.$emit('escape-key')
          this.hide()
        }
      })

      this.__showPortal()
      this.__configureScrollTarget()

      this.absoluteOffset = void 0

      if (evt !== void 0 && (this.touchPosition || this.contextMenu)) {
        const pos = position(evt)

        if (pos.left !== void 0) {
          const { top, left } = this.anchorEl.getBoundingClientRect()
          this.absoluteOffset = { left: pos.left - left, top: pos.top - top }
        }
      }

      if (this.unwatch === void 0) {
        this.unwatch = this.$watch(
          () => this.$q.screen.width + '|' + this.$q.screen.height + '|' + this.self + '|' + this.anchor + '|' + this.$q.lang.rtl,
          this.updatePosition
        )
      }

      this.$el.dispatchEvent(create('popup-show', { bubbles: true }))

      // IE can have null document.activeElement
      if (this.noFocus !== true && document.activeElement !== null) {
        document.activeElement.blur()
      }

      this.__nextTick(() => {
        this.updatePosition()
        this.noFocus !== true && this.focus()
      })

      this.__setTimeout(() => {
        // required in order to avoid the "double-tap needed" issue
        if (this.$q.platform.is.ios === true) {
          // if auto-close, then this click should
          // not close the menu
          this.__avoidAutoClose = this.autoClose
          this.__portal.$el.click()
        }

        this.updatePosition()
        this.__showPortal(true)
        this.$emit('show', evt)
      }, 300)
    },

    __hide (evt) {
      this.__anchorCleanup(true)

      // check null for IE
      if (
        this.__refocusTarget !== void 0 &&
        this.__refocusTarget !== null &&
        (
          // menu was hidden from code or ESC plugin
          evt === void 0 ||
          // menu was not closed from a mouse or touch clickOutside
          evt.qClickOutside !== true
        )
      ) {
        this.__refocusTarget.focus()
      }

      this.$el.dispatchEvent(create('popup-hide', { bubbles: true }))

      this.__setTimeout(() => {
        this.__hidePortal()
        this.$emit('hide', evt)
      }, 300)
    },

    __anchorCleanup (hiding) {
      this.absoluteOffset = void 0

      if (this.unwatch !== void 0) {
        this.unwatch()
        this.unwatch = void 0
      }

      if (hiding === true || this.showing === true) {
        EscapeKey.pop(this)
        this.__unconfigureScrollTarget()
      }
    },

    __unconfigureScrollTarget () {
      if (this.__scrollTarget !== void 0) {
        this.__changeScrollEvent(this.__scrollTarget)
        this.__scrollTarget = void 0
      }
    },

    __configureScrollTarget () {
      if (this.anchorEl !== void 0 || this.scrollTarget !== void 0) {
        this.__scrollTarget = getScrollTarget(this.anchorEl, this.scrollTarget)
        this.__changeScrollEvent(this.__scrollTarget, this.updatePosition)
      }
    },

    __onAutoClose (e) {
      // if auto-close, then the ios double-tap fix which
      // issues a click should not close the menu
      if (this.__avoidAutoClose !== true) {
        closePortalMenus(this, e)
        this.qListeners.click !== void 0 && this.$emit('click', e)
      }
      else {
        this.__avoidAutoClose = false
      }
    },

    updatePosition () {
      if (this.anchorEl === void 0 || this.__portal === void 0) {
        return
      }

      const el = this.__portal.$el

      if (el.nodeType === 8) { // IE replaces the comment with delay
        setTimeout(this.updatePosition, 25)
        return
      }

      setPosition({
        el,
        offset: this.offset,
        anchorEl: this.anchorEl,
        anchorOrigin: this.anchorOrigin,
        selfOrigin: this.selfOrigin,
        absoluteOffset: this.absoluteOffset,
        fit: this.fit,
        cover: this.cover,
        maxHeight: this.maxHeight,
        maxWidth: this.maxWidth
      })
    },

    __onClickOutside (e) {
      if (this.persistent !== true && this.showing === true) {
        const targetClassList = e.target.classList

        closePortalMenus(this, e)
        if (
          // always prevent touch event
          e.type === 'touchstart' ||
          // prevent click if it's on a dialog backdrop
          targetClassList.contains('q-dialog__backdrop')
        ) {
          stopAndPreventClick(e)
        }
        return true
      }
    },

    __renderPortal (h) {
      return h('transition', {
        props: { name: this.transition }
      }, [
        this.showing === true ? h('div', {
          ref: 'inner',
          staticClass: 'q-menu q-position-engine scroll' + this.menuClass,
          class: this.contentClass,
          style: this.contentStyle,
          attrs: this.attrs,
          on: this.onEvents,
          directives: [{
            name: 'click-outside',
            value: this.__onClickOutside,
            arg: this.anchorEl
          }]
        }, slot(this, 'default')) : null
      ])
    }
  },

  mounted () {
    this.__processModelChange(this.value)
  },

  beforeDestroy () {
    // When the menu is destroyed while open we can only emit the event on anchorEl
    if (this.showing === true && this.anchorEl !== void 0) {
      this.anchorEl.dispatchEvent(
        create('popup-hide', { bubbles: true })
      )
    }
  }
})
