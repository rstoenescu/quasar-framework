import Vue from 'vue'

import QMenu from '../menu/QMenu.js'
import QBtn from '../btn/QBtn.js'

import AttrsMixin from '../../mixins/attrs.js'

import clone from '../../utils/clone.js'
import { isDeepEqual } from '../../utils/is.js'
import { slot } from '../../utils/slot.js'
import { isKeyCode } from '../../utils/key-composition.js'
import cache from '../../utils/cache.js'

export default Vue.extend({
  name: 'QPopupEdit',

  mixins: [ AttrsMixin ],

  props: {
    value: {
      required: true
    },
    title: String,
    buttons: Boolean,
    labelSet: String,
    labelCancel: String,

    color: {
      type: String,
      default: 'primary'
    },
    validate: {
      type: Function,
      default: () => true
    },

    autoSave: Boolean,

    /* menu props overrides */
    cover: {
      type: Boolean,
      default: true
    },
    contentClass: String,
    /* end of menu props */

    disable: Boolean
  },

  data () {
    return {
      initialValue: ''
    }
  },

  computed: {
    classes () {
      return 'q-popup-edit' +
        (this.contentClass !== void 0 ? ` ${this.contentClass}` : '')
    },

    defaultSlotScope () {
      return {
        initialValue: this.initialValue,
        value: this.value,
        emitValue: this.__emitValue,
        validate: this.validate,
        set: this.set,
        cancel: this.cancel
      }
    },

    menuProps () {
      return {
        ...this.qAttrs,
        cover: this.cover,
        contentClass: this.classes
      }
    }
  },

  methods: {
    set () {
      if (this.validate(this.value) !== true) {
        return
      }
      if (this.__hasChanged() === true) {
        this.$emit('save', this.value, this.initialValue)
      }
      this.__close()
    },

    cancel () {
      if (this.__hasChanged() === true) {
        this.$emit('input', this.initialValue)
        this.$emit('cancel', this.value, this.initialValue)
      }
      this.__close()
    },

    show (e) {
      this.$refs.menu !== void 0 && this.$refs.menu.show(e)
    },

    hide (e) {
      this.$refs.menu !== void 0 && this.$refs.menu.hide(e)
    },

    __hasChanged () {
      return isDeepEqual(this.value, this.initialValue) === false
    },

    __emitValue (val) {
      if (this.disable !== true) {
        this.$emit('input', val)
      }
    },

    __close () {
      this.validated = true
      this.$refs.menu.showing === true && this.$refs.menu.hide()
    },

    __reposition () {
      this.$nextTick(() => {
        this.$refs.menu.updatePosition()
      })
    },

    __getContent (h) {
      const
        title = slot(this, 'title', this.title),
        child = this.$scopedSlots.default === void 0
          ? []
          : [].concat(this.$scopedSlots.default(this.defaultSlotScope))

      title && child.unshift(
        h('div', { staticClass: 'q-dialog__title q-mt-sm q-mb-sm' }, [ title ])
      )

      this.buttons === true && child.push(
        h('div', { staticClass: 'q-popup-edit__buttons row justify-center no-wrap' }, [
          h(QBtn, {
            props: {
              flat: true,
              color: this.color,
              label: this.labelCancel || this.$q.lang.label.cancel
            },
            on: cache(this, 'cancel', { click: this.cancel })
          }),
          h(QBtn, {
            props: {
              flat: true,
              color: this.color,
              label: this.labelSet || this.$q.lang.label.set
            },
            on: cache(this, 'ok', { click: this.set })
          })
        ])
      )

      return child
    }
  },

  render (h) {
    if (this.disable === true) { return }

    return h(QMenu, {
      ref: 'menu',
      props: this.menuProps,
      on: cache(this, 'menu', {
        'before-show': () => {
          this.validated = false
          this.initialValue = clone(this.value)
          this.watcher = this.$watch('value', this.__reposition)
          this.$emit('before-show')
        },
        show: () => {
          this.$emit('show')
        },
        'escape-key': this.cancel,
        'before-hide': () => {
          this.watcher()

          if (this.validated === false && this.__hasChanged() === true) {
            if (this.autoSave === true && this.validate(this.value) === true) {
              this.$emit('save', this.value, this.initialValue)
            }
            else {
              this.$emit('cancel', this.value, this.initialValue)
              this.$emit('input', this.initialValue)
            }
          }

          this.$emit('before-hide')
        },
        hide: () => {
          this.$emit('hide')
        },
        keyup: e => {
          isKeyCode(e, 13) === true && this.set()
        }
      })
    }, this.__getContent(h))
  }
})
