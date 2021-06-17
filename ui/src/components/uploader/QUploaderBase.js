import Vue from 'vue'

import QBtn from '../btn/QBtn.js'
import QIcon from '../icon/QIcon.js'
import QSpinner from '../spinner/QSpinner.js'
import QCircularProgress from '../circular-progress/QCircularProgress.js'

import FileMixin from '../../mixins/file.js'
import DarkMixin from '../../mixins/dark.js'

import { stop } from '../../utils/event.js'
import { humanStorageSize } from '../../utils/format.js'
import cache from '../../utils/cache.js'

export default Vue.extend({
  name: 'QUploaderBase',

  mixins: [ DarkMixin, FileMixin ],

  props: {
    label: String,

    color: String,
    textColor: String,

    square: Boolean,
    flat: Boolean,
    bordered: Boolean,

    noThumbnails: Boolean,
    autoUpload: Boolean,
    hideUploadBtn: Boolean,

    disable: Boolean,
    readonly: Boolean
  },

  provide () {
    return {
      __qUploaderGetInput: this.__getInputControl
    }
  },

  data () {
    return {
      files: [],
      queuedFiles: [],
      uploadedFiles: [],
      dnd: false,
      expanded: false,

      uploadSize: 0,
      uploadedSize: 0
    }
  },

  watch: {
    isUploading (newVal, oldVal) {
      if (oldVal === false && newVal === true) {
        this.$emit('start')
      }
      else if (oldVal === true && newVal === false) {
        this.$emit('finish')
      }
    }
  },

  computed: {
    /*
     * When extending:
     *   Required : isUploading
     *   Optional: isBusy
     */

    canUpload () {
      return this.editable === true &&
        this.isBusy !== true &&
        this.isUploading !== true &&
        this.queuedFiles.length > 0
    },

    canAddFiles () {
      return (
        this.editable === true &&
        this.isUploading !== true &&
        // if single selection and no files are queued:
        (this.multiple === true || this.queuedFiles.length === 0) &&
        // if max-files is set and current number of files does not exceeds it:
        (this.maxFiles === void 0 || this.files.length < this.maxFilesNumber) &&
        // if max-total-size is set and current upload size does not exceeds it:
        (this.maxTotalSize === void 0 || this.uploadSize < this.maxTotalSizeNumber)
      )
    },

    uploadProgress () {
      return this.uploadSize === 0
        ? 0
        : this.uploadedSize / this.uploadSize
    },

    uploadProgressLabel () {
      return this.__getProgressLabel(this.uploadProgress)
    },

    uploadedSizeLabel () {
      return humanStorageSize(this.uploadedSize)
    },

    uploadSizeLabel () {
      return humanStorageSize(this.uploadSize)
    },

    colorClass () {
      const cls = []
      this.color !== void 0 && cls.push(`bg-${this.color}`)
      this.textColor !== void 0 && cls.push(`text-${this.textColor}`)
      return cls.join(' ')
    },

    editable () {
      return this.disable !== true && this.readonly !== true
    }
  },

  methods: {
    reset () {
      if (!this.disable) {
        this.abort()
        this.uploadedSize = 0
        this.uploadSize = 0
        this.__revokeImgURLs()
        this.files = []
        this.queuedFiles = []
        this.uploadedFiles = []
      }
    },

    removeUploadedFiles () {
      this.__removeFiles([ 'uploaded' ], () => {
        this.uploadedFiles = []
      })
    },

    removeQueuedFiles () {
      this.__removeFiles([ 'idle', 'failed' ], ({ size }) => {
        this.uploadSize -= size
        this.queuedFiles = []
      })
    },

    __removeFiles (statusList, cb) {
      if (this.disable === true) {
        return
      }

      const removed = {
        files: [],
        size: 0
      }

      const files = this.files.filter(f => {
        if (statusList.indexOf(f.__status) === -1) {
          return true
        }

        removed.size += f.size
        removed.files.push(f)

        f._img !== void 0 && window.URL.revokeObjectURL(f._img.src)

        return false
      })

      if (removed.files.length > 0) {
        this.files = files
        cb !== void 0 && cb(removed)
        this.$emit('removed', removed.files)
      }
    },

    removeFile (file) {
      if (this.disable) { return }

      if (file.__status === 'uploaded') {
        this.uploadedFiles = this.uploadedFiles.filter(f => f.name !== file.name)
      }
      else if (file.__status === 'uploading') {
        file.__abort()
      }
      else {
        this.uploadSize -= file.size
      }

      this.files = this.files.filter(f => {
        if (f.name !== file.name) {
          return true
        }

        f._img !== void 0 && window.URL.revokeObjectURL(f._img.src)

        return false
      })
      this.queuedFiles = this.queuedFiles.filter(f => f.name !== file.name)
      this.$emit('removed', [ file ])
    },

    __revokeImgURLs () {
      this.files.forEach(f => {
        f._img !== void 0 && window.URL.revokeObjectURL(f._img.src)
      })
    },

    __getFileInput () {
      return this.$refs.input ||
        this.$el.getElementsByClassName('q-uploader__input')[0]
    },

    __getProgressLabel (p) {
      return (p * 100).toFixed(2) + '%'
    },

    __updateFile (file, status, uploadedSize) {
      file.__status = status

      if (status === 'idle') {
        file.__uploaded = 0
        file.__progress = 0
        file.__sizeLabel = humanStorageSize(file.size)
        file.__progressLabel = '0.00%'
        return
      }
      if (status === 'failed') {
        this.$forceUpdate()
        return
      }

      file.__uploaded = status === 'uploaded'
        ? file.size
        : uploadedSize

      file.__progress = status === 'uploaded'
        ? 1
        : Math.min(0.9999, file.__uploaded / file.size)

      file.__progressLabel = this.__getProgressLabel(file.__progress)
      this.$forceUpdate()
    },

    __addFiles (e, fileList) {
      const processedFiles = this.__processFiles(e, fileList, this.files, true)

      if (processedFiles === void 0) { return }

      const files = processedFiles
        .filter(file => this.files.findIndex(f => file.name === f.name) === -1)

      if (files === void 0) { return }

      const fileInput = this.__getFileInput()
      if (fileInput !== void 0) {
        fileInput.value = ''
      }

      files.forEach(file => {
        this.__updateFile(file, 'idle')
        this.uploadSize += file.size

        if (this.noThumbnails !== true && file.type.toUpperCase().startsWith('IMAGE')) {
          const img = new Image()
          img.src = window.URL.createObjectURL(file)
          file.__img = img
        }
      })

      this.files = this.files.concat(files)
      this.queuedFiles = this.queuedFiles.concat(files)
      this.$emit('added', files)
      this.autoUpload === true && this.upload()
    },

    __getBtn (h, show, icon, fn) {
      if (show === true) {
        return h(QBtn, {
          props: {
            type: 'a',
            icon: this.$q.iconSet.uploader[icon],
            flat: true,
            dense: true
          },
          on: icon === 'add' ? null : { click: fn }
        }, icon === 'add' ? this.__getInputControl(h) : null)
      }
    },

    __getInputControl (h) {
      return [
        h('input', {
          ref: 'input',
          staticClass: 'q-uploader__input overflow-hidden absolute-full',
          attrs: {
            tabindex: -1,
            type: 'file',
            title: '', // try to remove default tooltip
            accept: this.accept,
            capture: this.capture,
            ...(this.multiple === true ? { multiple: true } : {})
          },
          on: cache(this, 'input', {
            mousedown: stop, // need to stop refocus from QBtn
            change: this.__addFiles
          })
        })
      ]
    },

    __getHeader (h) {
      if (this.$scopedSlots.header !== void 0) {
        return this.$scopedSlots.header(this)
      }

      return [
        h('div', {
          staticClass: 'q-uploader__header-content flex flex-center no-wrap q-gutter-xs'
        }, [
          this.__getBtn(h, this.queuedFiles.length > 0, 'removeQueue', this.removeQueuedFiles),
          this.__getBtn(h, this.uploadedFiles.length > 0, 'removeUploaded', this.removeUploadedFiles),

          this.isUploading === true
            ? h(QSpinner, { staticClass: 'q-uploader__spinner' })
            : null,

          h('div', { staticClass: 'col column justify-center' }, [
            this.label !== void 0
              ? h('div', { staticClass: 'q-uploader__title' }, [ this.label ])
              : null,

            h('div', { staticClass: 'q-uploader__subtitle' }, [
              this.uploadSizeLabel + ' / ' + this.uploadProgressLabel
            ])
          ]),

          this.__getBtn(h, this.canAddFiles, 'add', this.pickFiles),
          this.__getBtn(h, this.hideUploadBtn === false && this.canUpload === true, 'upload', this.upload),
          this.__getBtn(h, this.isUploading, 'clear', this.abort)
        ])
      ]
    },

    __getList (h) {
      if (this.$scopedSlots.list !== void 0) {
        return this.$scopedSlots.list(this)
      }

      return this.files.map(file => h('div', {
        key: file.name,
        staticClass: 'q-uploader__file relative-position',
        class: {
          'q-uploader__file--img': this.noThumbnails !== true && file.__img !== void 0,
          'q-uploader__file--failed': file.__status === 'failed',
          'q-uploader__file--uploaded': file.__status === 'uploaded'
        },
        style: this.noThumbnails !== true && file.__img !== void 0 ? {
          backgroundImage: 'url("' + file.__img.src + '")'
        } : null
      }, [
        h('div', {
          staticClass: 'q-uploader__file-header row flex-center no-wrap'
        }, [
          file.__status === 'failed'
            ? h(QIcon, {
              staticClass: 'q-uploader__file-status',
              props: {
                name: this.$q.iconSet.type.negative,
                color: 'negative'
              }
            })
            : null,

          h('div', { staticClass: 'q-uploader__file-header-content col' }, [
            h('div', { staticClass: 'q-uploader__title' }, [ file.name ]),
            h('div', {
              staticClass: 'q-uploader__subtitle row items-center no-wrap'
            }, [
              file.__sizeLabel + ' / ' + file.__progressLabel
            ])
          ]),

          file.__status === 'uploading'
            ? h(QCircularProgress, {
              props: {
                value: file.__progress,
                min: 0,
                max: 1,
                indeterminate: file.__progress === 0
              }
            })
            : h(QBtn, {
              props: {
                round: true,
                dense: true,
                flat: true,
                icon: this.$q.iconSet.uploader[file.__status === 'uploaded' ? 'done' : 'clear']
              },
              on: {
                click: () => { this.removeFile(file) }
              }
            })
        ])
      ]))
    }
  },

  beforeDestroy () {
    this.isUploading === true && this.abort()
    this.files.length > 0 && this.__revokeImgURLs()
  },

  render (h) {
    const children = [
      h('div', {
        staticClass: 'q-uploader__header',
        class: this.colorClass
      }, this.__getHeader(h)),

      h('div', {
        staticClass: 'q-uploader__list scroll'
      }, this.__getList(h)),

      this.__getDnd(h, 'uploader')
    ]

    this.isBusy === true && children.push(
      h('div', {
        staticClass: 'q-uploader__overlay absolute-full flex flex-center'
      }, [ h(QSpinner) ])
    )

    return h('div', {
      staticClass: 'q-uploader column no-wrap',
      class: {
        [`q-uploader--${this.darkSuffix} q-${this.darkSuffix}`]: true,
        'q-uploader--bordered': this.bordered,
        'q-uploader--square no-border-radius': this.square,
        'q-uploader--flat no-shadow': this.flat,
        'disabled q-uploader--disable': this.disable
      },
      on: this.canAddFiles === true
        ? cache(this, 'drag', { dragover: this.__onDragOver })
        : null
    }, children)
  }
})
