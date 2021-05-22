import Vue from 'vue'

import { onTransitionHideScroll } from '../mixins/transition'

import TouchSwipe from '../directives/TouchSwipe.js'

import ListenersMixin from './listeners.js'

import { stop } from '../utils/event.js'
import { slot } from '../utils/slot.js'
import cache, { cacheWithFn } from '../utils/cache.js'

function getPanelWrapper (h) {
  return h('div', {
    staticClass: 'q-panel scroll',
    attrs: { role: 'tabpanel' },
    // stop propagation of content emitted @input
    // which would tamper with Panel's model
    on: cache(this, 'stop', { input: stop })
  }, slot(this, 'default'))
}

const PanelWrapper = Vue.extend({
  render: getPanelWrapper
})

export const PanelParentMixin = {
  mixins: [ ListenersMixin ],

  directives: {
    TouchSwipe
  },

  props: {
    value: {
      required: true
    },

    animated: Boolean,
    infinite: Boolean,
    swipeable: Boolean,
    vertical: Boolean,

    transitionPrev: String,
    transitionNext: String,

    keepAlive: Boolean,
    keepAliveInclude: [ String, Array, RegExp ],
    keepAliveExclude: [ String, Array, RegExp ],
    keepAliveMax: Number
  },

  data () {
    return {
      panelIndex: null,
      panelTransition: null
    }
  },

  computed: {
    panelDirectives () {
      if (this.swipeable === true) {
        return [{
          name: 'touch-swipe',
          value: this.__swipe,
          modifiers: {
            horizontal: this.vertical !== true,
            vertical: this.vertical,
            mouse: true
          }
        }]
      }
    },

    contentKey () {
      return typeof this.value === 'string' || typeof this.value === 'number'
        ? this.value
        : String(this.value)
    },

    transitionPrevComputed () {
      return this.transitionPrev || `slide-${this.vertical === true ? 'down' : 'right'}`
    },

    transitionNextComputed () {
      return this.transitionNext || `slide-${this.vertical === true ? 'up' : 'left'}`
    },

    keepAliveProps () {
      return {
        include: this.keepAliveInclude,
        exclude: this.keepAliveExclude,
        max: this.keepAliveMax
      }
    },

    needsUniqueWrapper () {
      return this.keepAliveInclude !== void 0 ||
        this.keepAliveExclude !== void 0
    }
  },

  watch: {
    value (newVal, oldVal) {
      const index = this.__isValidPanelName(newVal) === true
        ? this.__getPanelIndex(newVal)
        : -1

      if (this.__forcedPanelTransition !== true) {
        this.__updatePanelTransition(
          index === -1 ? 0 : (index < this.__getPanelIndex(oldVal) ? -1 : 1)
        )
      }

      if (this.panelIndex !== index) {
        this.panelIndex = index
        this.$emit('before-transition', newVal, oldVal)
        this.$nextTick(() => {
          this.$emit('transition', newVal, oldVal)
        })
      }
    }
  },

  methods: {
    next () {
      this.__go(1)
    },

    previous () {
      this.__go(-1)
    },

    goTo (name) {
      this.$emit('input', name)
    },

    __isValidPanelName (name) {
      return name !== void 0 && name !== null && name !== ''
    },

    __getPanelIndex (name) {
      return this.panels.findIndex(panel => {
        const opt = panel.componentOptions.propsData
        return opt.name === name &&
          opt.disable !== '' &&
          opt.disable !== true
      })
    },

    __getEnabledPanels () {
      return this.panels.filter(panel => {
        const opt = panel.componentOptions.propsData
        return opt.disable !== '' && opt.disable !== true
      })
    },

    __updatePanelTransition (direction) {
      const val = direction !== 0 && this.animated === true && this.panelIndex !== -1
        ? 'q-transition--' + (direction === -1 ? this.transitionPrevComputed : this.transitionNextComputed)
        : null

      if (this.panelTransition !== val) {
        this.panelTransition = val
      }
    },

    __go (direction, startIndex = this.panelIndex) {
      let index = startIndex + direction
      const slots = this.panels

      while (index > -1 && index < slots.length) {
        const opt = slots[index].componentOptions

        if (
          opt !== void 0 &&
          opt.propsData.disable !== '' &&
          opt.propsData.disable !== true
        ) {
          this.__updatePanelTransition(direction)
          this.__forcedPanelTransition = true
          this.$emit('input', slots[index].componentOptions.propsData.name)
          setTimeout(() => {
            this.__forcedPanelTransition = false
          })
          return
        }

        index += direction
      }

      if (this.infinite === true && slots.length > 0 && startIndex !== -1 && startIndex !== slots.length) {
        this.__go(direction, direction === -1 ? slots.length : -1)
      }
    },

    __swipe (evt) {
      const dir = this.vertical === true ? 'up' : 'left'
      this.__go((this.$q.lang.rtl === true ? -1 : 1) * (evt.direction === dir ? 1 : -1))
    },

    __updatePanelIndex () {
      const index = this.__getPanelIndex(this.value)

      if (this.panelIndex !== index) {
        this.panelIndex = index
      }

      return true
    },

    __getPanelContent (h) {
      if (this.panels.length === 0) {
        return
      }

      const panel = this.__isValidPanelName(this.value) &&
        this.__updatePanelIndex() &&
        this.panels[this.panelIndex]

      const content = this.keepAlive === true
        ? [
          h('keep-alive', { props: this.keepAliveProps }, [
            h(
              this.needsUniqueWrapper === true
                ? cacheWithFn(this, this.contentKey, () => Vue.extend({
                  name: this.contentKey,
                  render: getPanelWrapper
                }))
                : PanelWrapper,
              { key: this.contentKey },
              [ panel ]
            )
          ])
        ]
        : [
          h('div', {
            staticClass: 'q-panel scroll',
            key: this.contentKey,
            attrs: { role: 'tabpanel' },
            // stop propagation of content emitted @input
            // which would tamper with Panel's model
            on: cache(this, 'stop', { input: stop })
          }, [ panel ])
        ]

      return this.animated === true
        ? [
          h('transition', {
            props: { name: this.panelTransition },
            on: onTransitionHideScroll
          }, content)
        ]
        : content
    }
  },

  render (h) {
    this.panels = slot(this, 'default', []).filter(
      panel => panel !== void 0 &&
        panel.componentOptions !== void 0 &&
        panel.componentOptions.propsData !== void 0 &&
        this.__isValidPanelName(panel.componentOptions.propsData.name)
    )

    return this.__renderPanels(h)
  }
}

export const PanelChildMixin = {
  mixins: [ ListenersMixin ],

  props: {
    name: {
      required: true
    },
    disable: Boolean
  }
}
