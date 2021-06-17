import { stop, stopAndPrevent } from '../utils/event.js'
import cache from '../utils/cache.js'

function filterFiles (files, rejectedFiles, failedPropValidation, filterFn) {
  const acceptedFiles = []

  files.forEach(file => {
    if (filterFn(file) === true) {
      acceptedFiles.push(file)
    }
    else {
      rejectedFiles.push({ failedPropValidation, file })
    }
  })

  return acceptedFiles
}

function stopAndPreventDrag (e) {
  e && e.dataTransfer && (e.dataTransfer.dropEffect = 'copy')
  stopAndPrevent(e)
}

export default {
  props: {
    multiple: Boolean,
    accept: String,
    capture: String,
    maxFileSize: [ Number, String ],
    maxTotalSize: [ Number, String ],
    maxFiles: [ Number, String ],
    filter: Function
  },

  computed: {
    extensions () {
      if (this.accept !== void 0) {
        return this.accept.split(',').map(ext => {
          ext = ext.trim()
          if (ext === '*') { // support "*"
            return '*/'
          }
          else if (ext.endsWith('/*')) { // support "image/*" or "*/*"
            ext = ext.slice(0, ext.length - 1)
          }
          return ext.toUpperCase()
        })
      }
    },

    maxFilesNumber () {
      return parseInt(this.maxFiles, 10)
    },

    maxTotalSizeNumber () {
      return parseInt(this.maxTotalSize, 10)
    }
  },

  methods: {
    pickFiles (ev) {
      if (this.editable === true) {
        if (ev !== Object(ev)) {
          ev = { target: null }
        }

        if (ev.target !== null && ev.target.matches('input[type="file"]') === true) {
          // stop propagation if it's not a real pointer event
          ev.clientX === 0 && ev.clientY === 0 && stop(ev)
        }
        else {
          const input = this.__getFileInput()
          input && input !== ev.target && input.click(ev)
        }
      }
    },

    addFiles (files) {
      if (this.editable && files) {
        this.__addFiles(null, files)
      }
    },

    __processFiles (e, filesToProcess, currentFileList, append) {
      let files = Array.from(filesToProcess || e.target.files)
      const rejectedFiles = []

      const done = () => {
        if (rejectedFiles.length > 0) {
          this.$emit('rejected', rejectedFiles)
        }
      }

      // filter file types
      if (this.accept !== void 0 && this.extensions.indexOf('*/') === -1) {
        files = filterFiles(files, rejectedFiles, 'accept', file => {
          return this.extensions.some(ext => (
            file.type.toUpperCase().startsWith(ext) ||
            file.name.toUpperCase().endsWith(ext)
          ))
        })

        if (files.length === 0) { return done() }
      }

      // filter max file size
      if (this.maxFileSize !== void 0) {
        const maxFileSize = parseInt(this.maxFileSize, 10)
        files = filterFiles(files, rejectedFiles, 'max-file-size', file => {
          return file.size <= maxFileSize
        })

        if (files.length === 0) { return done() }
      }

      // Cordova/iOS allows selecting multiple files even when the
      // multiple attribute is not specified. We also normalize drag'n'dropped
      // files here:
      if (this.multiple !== true) {
        files = [ files[0] ]
      }

      if (this.maxTotalSize !== void 0) {
        let size = append === true
          ? currentFileList.reduce((total, file) => total + file.size, 0)
          : 0

        files = filterFiles(files, rejectedFiles, 'max-total-size', file => {
          size += file.size
          return size <= this.maxTotalSizeNumber
        })

        if (files.length === 0) { return done() }
      }

      // do we have custom filter function?
      if (typeof this.filter === 'function') {
        const filteredFiles = this.filter(files)
        files = filterFiles(files, rejectedFiles, 'filter', file => {
          return filteredFiles.includes(file)
        })
      }

      if (this.maxFiles !== void 0) {
        let filesNumber = append === true
          ? currentFileList.length
          : 0

        files = filterFiles(files, rejectedFiles, 'max-files', () => {
          filesNumber++
          return filesNumber <= this.maxFilesNumber
        })

        if (files.length === 0) { return done() }
      }

      done()

      if (files.length > 0) {
        return files
      }
    },

    __onDragOver (e) {
      stopAndPreventDrag(e)
      this.dnd !== true && (this.dnd = true)
    },

    __onDragLeave (e) {
      stopAndPrevent(e)
      this.dnd = false
    },

    __onDrop (e) {
      stopAndPreventDrag(e)
      const files = e.dataTransfer.files

      if (files.length > 0) {
        this.__addFiles(null, files)
      }

      this.dnd = false
    },

    __getDnd (h, type) {
      if (this.dnd === true) {
        return h('div', {
          staticClass: `q-${type}__dnd absolute-full`,
          on: cache(this, 'dnd', {
            dragenter: stopAndPreventDrag,
            dragover: stopAndPreventDrag,
            dragleave: this.__onDragLeave,
            drop: this.__onDrop
          })
        })
      }
    }
  }
}

export const FileValueMixin = {
  computed: {
    formDomProps () {
      if (this.type !== 'file') {
        return
      }

      try {
        const dt = 'DataTransfer' in window
          ? new DataTransfer()
          : ('ClipboardEvent' in window
            ? new ClipboardEvent('').clipboardData
            : void 0
          )

        if (Object(this.value) === this.value) {
          ('length' in this.value
            ? Array.from(this.value)
            : [ this.value ]
          ).forEach(file => {
            dt.items.add(file)
          })
        }

        return {
          files: dt.files
        }
      }
      catch (e) {
        return {
          files: void 0
        }
      }
    }
  }
}
