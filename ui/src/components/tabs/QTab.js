import Vue from 'vue'

import QIcon from '../icon/QIcon.js'

import RippleMixin from '../../mixins/ripple.js'
import ListenersMixin from '../../mixins/listeners.js'

import { stop, prevent, stopAndPrevent } from '../../utils/event.js'
import { mergeSlot } from '../../utils/slot.js'
import { shouldIgnoreKey } from '../../utils/key-composition.js'

let uid = 0

export default Vue.extend({
  name: 'QTab',

  mixins: [ RippleMixin, ListenersMixin ],

  inject: {
    tabs: {
      default () {
        console.error('QTab/QRouteTab components need to be child of QTabs')
      }
    },
    __activateTab: {},
    __registerTab: {},
    __unregisterTab: {},
    __focusTab: {},
    __unfocusTab: {},
    __onKbdNavigate: {}
  },

  props: {
    icon: String,
    label: [Number, String],

    alert: [Boolean, String],
    alertIcon: String,

    name: {
      type: [Number, String],
      default: () => `t_${uid++}`
    },

    noCaps: Boolean,

    tabindex: [String, Number],
    disable: Boolean,

    contentClass: String
  },

  computed: {
    isActive () {
      return this.tabs.current === this.name
    },

    classes () {
      return {
        [`q-tab--${this.isActive ? '' : 'in'}active`]: true,
        [`text-${this.tabs.activeColor}`]: this.isActive && this.tabs.activeColor,
        [`bg-${this.tabs.activeBgColor}`]: this.isActive && this.tabs.activeBgColor,
        'q-tab--full': this.icon && this.label && !this.tabs.inlineLabel,
        'q-tab--no-caps': this.noCaps === true || this.tabs.noCaps === true,
        'q-focusable q-hoverable cursor-pointer': !this.disable,
        disabled: this.disable
      }
    },

    innerClass () {
      return (this.tabs.inlineLabel === true ? 'row no-wrap q-tab__content--inline' : 'column') +
        (this.contentClass !== void 0 ? ` ${this.contentClass}` : '')
    },

    computedTabIndex () {
      if (this.disable === true) {
        return -1
      }

      return this.tabs.focused === true || (this.isActive !== true && this.tabs.hasCurrent === true)
        ? -1
        : this.tabindex || 0
    },

    computedRipple () {
      return this.ripple === false
        ? false
        : Object.assign(
          { keyCodes: [13, 32], early: true },
          this.ripple === true ? {} : this.ripple
        )
    },

    onEvents () {
      return {
        input: stop,
        ...this.qListeners,
        focusin: this.__onFocusin,
        focusout: this.__onFocusout,
        click: this.__activate,
        keydown: this.__onKeydown
      }
    },

    attrs () {
      const attrs = {
        tabindex: this.computedTabIndex,
        role: 'tab',
        'aria-selected': this.isActive === true ? 'true' : 'false'
      }

      if (this.disable === true) {
        attrs['aria-disabled'] = 'true'
      }

      return attrs
    }
  },

  watch: {
    name (newName, oldName) {
      this.__unregisterTab(oldName)
      this.__registerTab(newName)
    }
  },

  methods: {
    __activate (e, keyboard) {
      keyboard !== true && setTimeout(() => {
        this.$refs.blurTarget !== void 0 && this.$refs.blurTarget.focus()
      })

      if (this.disable !== true) {
        this.qListeners.click !== void 0 && this.$emit('click', e)
        this.__activateTab(this.name)
      }
    },

    __onFocusin (e) {
      e.target === this.$el && this.__focusTab(this.$el)

      this.qListeners.focusin !== void 0 && this.$emit('focusin', e)
    },

    __onFocusout (e) {
      this.__unfocusTab()

      this.qListeners.focusout !== void 0 && this.$emit('focusout', e)
    },

    __onKeydown (e) {
      if (shouldIgnoreKey(e)) {
        return
      }

      if ([ 13, 32 ].indexOf(e.keyCode) !== -1) {
        this.__activate(e, true)
        prevent(e)
      }
      else if (e.keyCode >= 35 && e.keyCode <= 40) {
        this.__onKbdNavigate(e.keyCode, this.$el) === true && stopAndPrevent(e)
      }
    },

    __getContent (h) {
      const
        narrow = this.tabs.narrowIndicator,
        content = [],
        indicator = h('div', {
          staticClass: 'q-tab__indicator',
          class: this.tabs.indicatorClass
        })

      this.icon !== void 0 && content.push(
        h(QIcon, {
          staticClass: 'q-tab__icon',
          props: { name: this.icon }
        })
      )

      this.label !== void 0 && content.push(
        h('div', {
          staticClass: 'q-tab__label'
        }, [ this.label ])
      )

      this.alert !== false && content.push(
        this.alertIcon !== void 0
          ? h(QIcon, {
            staticClass: 'q-tab__alert-icon',
            props: {
              color: this.alert !== true
                ? this.alert
                : void 0,
              name: this.alertIcon
            }
          })
          : h('div', {
            staticClass: 'q-tab__alert',
            class: this.alert !== true
              ? `text-${this.alert}`
              : null
          })
      )

      narrow === true && content.push(indicator)

      const node = [
        h('div', { staticClass: 'q-focus-helper', attrs: { tabindex: -1 }, ref: 'blurTarget' }),

        h('div', {
          staticClass: 'q-tab__content self-stretch flex-center relative-position q-anchor--skip q-key-group-navigation--ignore-key non-selectable',
          class: this.innerClass
        }, mergeSlot(content, this, 'default'))
      ]

      narrow === false && node.push(indicator)

      return node
    },

    __renderTab (h, tag, props) {
      const data = {
        staticClass: 'q-tab relative-position self-stretch flex flex-center text-center no-outline',
        class: this.classes,
        attrs: this.attrs,
        directives: this.ripple === false || this.disable === true ? null : [
          { name: 'ripple', value: this.computedRipple }
        ],
        [ tag === 'div' ? 'on' : 'nativeOn' ]: this.onEvents
      }

      if (props !== void 0) {
        data.props = props
      }

      return h(tag, data, this.__getContent(h))
    }
  },

  mounted () {
    this.__registerTab(this.name)
  },

  beforeDestroy () {
    this.__unregisterTab(this.name)
  },

  render (h) {
    return this.__renderTab(h, 'div')
  }
})
