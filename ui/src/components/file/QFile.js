import Vue from 'vue'

import QField from '../field/QField.js'
import QChip from '../chip/QChip.js'

import { FormFieldMixin } from '../../mixins/form.js'
import FileMixin, { FileValueMixin } from '../../mixins/file.js'

import { isSSR } from '../../plugins/Platform'
import { humanStorageSize } from '../../utils/format.js'
import cache from '../../utils/cache.js'
import { prevent } from '../../utils/event.js'

export default Vue.extend({
  name: 'QFile',

  mixins: [ QField, FileMixin, FormFieldMixin, FileValueMixin ],

  props: {
    /* SSR does not know about File & FileList */
    value: isSSR === true
      ? {}
      : [ File, FileList, Array ],

    append: Boolean,
    useChips: Boolean,
    displayValue: [ String, Number ],

    tabindex: {
      type: [ String, Number ],
      default: 0
    },

    counterLabel: Function,

    inputClass: [ Array, String, Object ],
    inputStyle: [ Array, String, Object ]
  },

  data () {
    return {
      dnd: false
    }
  },

  computed: {
    innerValue () {
      return Object(this.value) === this.value
        ? ('length' in this.value ? Array.from(this.value) : [ this.value ])
        : []
    },

    selectedString () {
      return this.innerValue
        .map(file => file.name)
        .join(', ')
    },

    totalSize () {
      return humanStorageSize(
        this.innerValue.reduce((acc, file) => acc + file.size, 0)
      )
    },

    counterProps () {
      return {
        totalSize: this.totalSize,
        filesNumber: this.innerValue.length,
        maxFiles: this.maxFiles
      }
    },

    computedCounter () {
      if (this.counterLabel !== void 0) {
        return this.counterLabel(this.counterProps)
      }

      const max = this.maxFiles
      return `${this.innerValue.length}${max !== void 0 ? ' / ' + max : ''} (${this.totalSize})`
    },

    inputAttrs () {
      return {
        tabindex: -1,
        type: 'file',
        title: '', // try to remove default tooltip,
        accept: this.accept,
        capture: this.capture,
        name: this.nameProp,
        ...this.qAttrs,
        id: this.targetUid,
        disabled: this.editable !== true
      }
    },

    isAppending () {
      return this.multiple === true && this.append === true
    }
  },

  methods: {
    removeAtIndex (index) {
      const files = this.innerValue.slice()
      files.splice(index, 1)
      this.__emitValue(files)
    },

    removeFile (file) {
      const index = this.innerValue.findIndex(file)
      if (index > -1) {
        this.removeAtIndex(index)
      }
    },

    __emitValue (files) {
      this.$emit('input', this.multiple === true ? files : files[0])
    },

    __onKeydown (e) {
      // prevent form submit if ENTER is pressed
      e.keyCode === 13 && prevent(e)
    },

    __onKeyup (e) {
      // only on ENTER and SPACE to match native input field
      if (e.keyCode === 13 || e.keyCode === 32) {
        this.pickFiles(e)
      }
    },

    __getFileInput () {
      return this.$refs.input
    },

    __addFiles (e, fileList) {
      const files = this.__processFiles(e, fileList, this.innerValue, this.isAppending)

      // if nothing to do...
      if (files === void 0) { return }

      // protect against input @change being called in a loop
      // like it happens on Safari, so don't emit same thing:
      if (
        this.multiple === true
          ? this.value && files.every(f => this.innerValue.includes(f))
          : this.value === files[ 0 ]
      ) {
        return
      }

      this.__emitValue(
        this.isAppending === true
          ? this.innerValue.concat(files)
          : files
      )
    },

    __getControl (h) {
      const data = {
        ref: 'target',
        staticClass: 'q-field__native row items-center cursor-pointer',
        attrs: {
          tabindex: this.tabindex
        }
      }

      if (this.editable === true) {
        data.on = cache(this, 'native', {
          dragover: this.__onDragOver,
          keydown: this.__onKeydown,
          keyup: this.__onKeyup
        })
      }

      return h('div', data, [ this.__getInput(h) ].concat(this.__getSelection(h)))
    },

    __getControlChild (h) {
      return this.__getDnd(h, 'file')
    },

    __getFiller (h) {
      return [
        h('input', {
          class: [ this.inputClass, 'q-file__filler' ],
          style: this.inputStyle,
          tabindex: -1
        })
      ]
    },

    __getSelection (h) {
      if (this.$scopedSlots.file !== void 0) {
        return this.innerValue.length === 0
          ? this.__getFiller(h)
          : this.innerValue.map((file, index) => this.$scopedSlots.file({ index, file, ref: this }))
      }

      if (this.$scopedSlots.selected !== void 0) {
        return this.innerValue.length === 0
          ? this.__getFiller(h)
          : this.$scopedSlots.selected({ files: this.innerValue, ref: this })
      }

      if (this.useChips === true) {
        return this.innerValue.length === 0
          ? this.__getFiller(h)
          : this.innerValue.map((file, i) => h(QChip, {
            key: 'file-' + i,
            props: {
              removable: this.editable,
              dense: true,
              textColor: this.color,
              tabindex: this.tabindex
            },
            on: cache(this, 'rem#' + i, {
              remove: () => { this.removeAtIndex(i) }
            })
          }, [
            h('span', {
              staticClass: 'ellipsis',
              domProps: {
                textContent: file.name
              }
            })
          ]))
      }

      const textContent = this.displayValue !== void 0
        ? this.displayValue
        : this.selectedString

      return textContent.length > 0
        ? [
          h('div', {
            style: this.inputStyle,
            class: this.inputClass,
            domProps: { textContent }
          })
        ]
        : this.__getFiller(h)
    },

    __getInput (h) {
      const data = {
        ref: 'input',
        staticClass: 'q-field__input fit absolute-full cursor-pointer',
        attrs: this.inputAttrs,
        domProps: this.formDomProps,
        on: cache(this, 'input', {
          change: this.__addFiles
        })
      }

      if (this.multiple === true) {
        data.attrs.multiple = true
      }

      return h('input', data)
    }
  },

  created () {
    this.fieldClass = 'q-file q-field--auto-height'

    // necessary for QField's clearable
    // and FileValueMixin
    this.type = 'file'
  }
})
