import Vue from 'vue'

import QBtn from '../btn/QBtn.js'
import QIcon from '../icon/QIcon.js'

import FabMixin from '../../mixins/fab.js'
import AttrsMixin from '../../mixins/attrs.js'
import ModelToggleMixin from '../../mixins/model-toggle.js'

import { slot, mergeSlot } from '../../utils/slot.js'
import cache from '../../utils/cache.js'

const directions = ['up', 'right', 'down', 'left']
const alignValues = [ 'left', 'center', 'right' ]

export default Vue.extend({
  name: 'QFab',

  inheritAttrs: false,

  mixins: [ FabMixin, AttrsMixin, ModelToggleMixin ],

  provide () {
    return {
      __qFab: this
    }
  },

  props: {
    icon: String,
    activeIcon: String,

    hideIcon: Boolean,
    hideLabel: {
      default: null
    },

    direction: {
      type: String,
      default: 'right',
      validator: v => directions.includes(v)
    },

    persistent: Boolean,

    verticalActionsAlign: {
      type: String,
      default: 'center',
      validator: v => alignValues.includes(v)
    }
  },

  data () {
    return {
      showing: this.value === true
    }
  },

  computed: {
    hideOnRouteChange () {
      return this.persistent !== true
    },

    classes () {
      return `q-fab--align-${this.verticalActionsAlign} ${this.formClass}` +
        (this.showing === true ? ' q-fab--opened' : '')
    },

    actionsClasses () {
      return `q-fab__actions--${this.direction}` + (this.showing === true ? ' q-fab__actions--opened' : '')
    },

    iconHolderClasses () {
      return this.showing === true ? 'q-fab__icon-holder--opened' : ''
    },

    attrs () {
      return {
        'aria-expanded': this.showing === true ? 'true' : 'false',
        'aria-haspopup': 'true',
        ...this.qAttrs
      }
    }
  },

  methods: {
    __onChildClick (evt) {
      this.hide(evt)

      if (this.$refs.trigger && this.$refs.trigger.$el) {
        this.$refs.trigger.$el.focus()
      }
    }
  },

  render (h) {
    const child = []

    this.hideIcon !== true && child.push(
      h('div', { staticClass: 'q-fab__icon-holder', class: this.iconHolderClasses }, [
        h(QIcon, {
          staticClass: 'q-fab__icon absolute-full',
          props: { name: this.icon || this.$q.iconSet.fab.icon }
        }),
        h(QIcon, {
          staticClass: 'q-fab__active-icon absolute-full',
          props: { name: this.activeIcon || this.$q.iconSet.fab.activeIcon }
        })
      ])
    )

    this.label !== '' && child[this.labelProps.action](
      h('div', this.labelProps.data, [ this.label ])
    )

    return h('div', {
      staticClass: 'q-fab z-fab row inline justify-center',
      class: this.classes,
      on: { ...this.qListeners }
    }, [
      h(QBtn, {
        ref: 'trigger',
        class: this.formClass,
        props: {
          ...this.$props,
          noWrap: true,
          stack: this.stacked,
          align: void 0,
          icon: void 0,
          label: void 0,
          noCaps: true,
          fab: true
        },
        attrs: this.attrs,
        on: cache(this, 'tog', {
          click: this.toggle
        })
      }, mergeSlot(child, this, 'tooltip')),

      h('div', {
        staticClass: 'q-fab__actions flex no-wrap inline',
        class: this.actionsClasses
      }, slot(this, 'default'))
    ])
  }
})
