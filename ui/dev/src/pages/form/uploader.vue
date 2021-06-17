<template>
  <div>
    <div class="q-layout-padding" :class="dark ? 'bg-black text-white' : ''">
      <div class="q-gutter-sm q-mb-md">
        <q-toggle v-model="dark" :dark="dark" label="Dark" :false-value="null" />
        <q-toggle v-model="square" :dark="dark" label="Square" />
        <q-toggle v-model="flat" :dark="dark" label="Flat" />
        <q-toggle v-model="bordered" :dark="dark" label="Bordered" />
        <q-toggle v-model="autoUpload" :dark="dark" label="Auto Upload" />
        <q-toggle v-model="batch" :dark="dark" label="Batch" />
        <q-toggle v-model="noThumbnails" :dark="dark" label="No Thumbnails" />
        <q-toggle v-model="label" :dark="dark" label="Label" />
        <q-toggle v-model="readonly" :dark="dark" label="Readonly (cannot upload)" />
        <q-toggle v-model="disable" :dark="dark" label="Disable" />
      </div>

      <div class="text-h6 q-my-md">
        Run "yarn dev:quploader" / "npm run dev:quploader"
      </div>

      <div class="q-gutter-sm">
        <q-uploader
          v-bind="props"
          multiple
          label="Multiple"
          :form-fields="[{name: 'my-field', value: 'my-value'}]"
          url="http://localhost:4444/upload"
          @added="onAdded"
          @removed="onRemoved"
          @start="onStart"
          @finish="onFinish"
          @uploaded="onUpload"
          @failed="onFail"
        />

        <q-uploader
          v-bind="props"
          label="Single"
          :form-fields="[{name: 'my-field', value: 'my-value'}]"
          url="http://localhost:4444/upload"
          @added="onAdded"
          @removed="onRemoved"
          @start="onStart"
          @finish="onFinish"
          @uploaded="onUpload"
          @failed="onFail"
        />

        <q-uploader
          v-bind="props"
          accept="image/png"
          multiple
          :max-file-size="41000"
          label="Png & max 41k only"
          :form-fields="[{name: 'my-field', value: 'my-value'}]"
          url="http://localhost:4444/upload"
          @added="onAdded"
          @removed="onRemoved"
          @start="onStart"
          @finish="onFinish"
          @uploaded="onUpload"
          @failed="onFail"
          @rejected="onRejected"
        />

        <q-uploader
          :dark="dark"
          label="Fn returning immediately"
          multiple
          :batch="batch"
          :factory="files => ({ url: 'http://localhost:4444/upload' })"
          @added="onAdded"
          @removed="onRemoved"
          @factory-failed="onFactoryFailed"
          @start="onStart"
          @finish="onFinish"
          @uploaded="onUpload"
          @failed="onFail"
        />

        <q-uploader
          :dark="dark"
          label="Fn returning promise"
          multiple
          :batch="batch"
          :factory="promiseFn"
          @added="onAdded"
          @removed="onRemoved"
          @factory-failed="onFactoryFailed"
          @start="onStart"
          @finish="onFinish"
          @uploaded="onUpload"
          @failed="onFail"
        />

        <q-uploader
          ref="aborter"
          :dark="dark"
          label="Aborting & fn returning promise"
          multiple
          :batch="batch"
          :factory="promiseFnAbort"
          @added="onAdded"
          @removed="onRemoved"
          @factory-failed="onFactoryFailed"
          @start="onStart"
          @finish="onFinish"
          @uploaded="onUpload"
          @failed="onFail"
        />

        <q-uploader
          :dark="dark"
          label="Fn returning promise - reject"
          multiple
          :batch="batch"
          :factory="rejectFn"
          @added="onAdded"
          @removed="onRemoved"
          @factory-failed="onFactoryFailed"
          @start="onStart"
          @finish="onFinish"
          @uploaded="onUpload"
          @failed="onFail"
        />

        <div>
          Header slot
        </div>
        <q-uploader
          v-bind="props"
          multiple
          url="http://localhost:4444/upload"
          @added="onAdded"
          @removed="onRemoved"
          @start="onStart"
          @finish="onFinish"
          @uploaded="onUpload"
          @failed="onFail"
        >
          <template v-slot:header="scope">
            <div class="row no-wrap items-center q-pa-sm q-gutter-xs">
              <q-btn v-if="scope.queuedFiles.length > 0" icon="clear_all" @click="scope.removeQueuedFiles" round dense flat />
              <q-btn v-if="scope.uploadedFiles.length > 0" icon="done_all" @click="scope.removeUploadedFiles" round dense flat />
              <q-spinner v-if="scope.isUploading" class="q-uploader__spinner" />
              <div class="col">
                <div class="q-uploader__title">
                  Upload your files
                </div>
                <div class="q-uploader__subtitle">
                  {{ scope.uploadSizeLabel }} / {{ scope.uploadProgressLabel }}
                </div>
              </div>
              <q-btn v-if="scope.canAddFiles" type="a" icon="add_box" @click="scope.pickFiles" round dense flat>
                <q-uploader-add-trigger />
              </q-btn>
              <q-btn v-if="scope.canUpload" icon="cloud_upload" @click="scope.upload" round dense flat />
              <q-btn v-if="scope.isUploading" icon="clear" @click="scope.abort" round dense flat />
            </div>
          </template>
        </q-uploader>

        <q-uploader v-bind="props" color="yellow" text-color="black" multiple url="http://localhost:4444/upload" />

        <q-uploader
          v-bind="props"
          label="Raw"
          send-raw
          url="http://localhost:4444/upload"
          @added="onAdded"
          @removed="onRemoved"
          @start="onStart"
          @finish="onFinish"
          @uploaded="onUpload"
          @failed="onFail"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      dark: null,
      square: false,
      flat: false,
      bordered: false,

      autoUpload: false,
      batch: true,
      noThumbnails: false,
      label: true,

      readonly: false,
      disable: false
    }
  },

  computed: {
    props () {
      return {
        dark: this.dark,
        square: this.square,
        flat: this.flat,
        bordered: this.bordered,

        autoUpload: this.autoUpload,
        batch: this.batch,
        noThumbnails: this.noThumbnails,
        label: this.label ? 'Upload files' : null,

        readonly: this.readonly,
        disable: this.disable
      }
    }
  },

  methods: {
    onChange (val) {
      console.log('@change', JSON.stringify(val))
    },
    onInput (val) {
      console.log('@input', JSON.stringify(val))
    },
    onAdded (files) {
      console.log(`@added ${files.length || 0} files`)
      console.log(files)
    },
    onRemoved (files) {
      console.log(`@removed ${files.length || 0} files`)
      console.log(files)
    },
    onFactoryFailed (err) {
      console.log(`@factory-failed`, err)
    },
    onStart () {
      console.log(`@start`)
    },
    onFinish () {
      console.log(`@finish`)
    },
    onUpload () {
      console.log('@uploaded')
    },
    onFail () {
      console.log('@failed')
    },
    onRejected (files) {
      console.log(`@rejected`, files)
    },
    promiseFn (files) {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('resolving promise', this.batch)
          resolve({
            batch: this.batch,
            url: 'http://localhost:4444/upload'
          })
        }, 2000)
      })
    },
    promiseFnAbort (files) {
      setTimeout(() => {
        this.$refs.aborter.abort()
      }, 100)
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('resolving promise', this.batch)
          resolve({
            batch: this.batch,
            url: 'http://localhost:4444/upload'
          })
        }, 2000)
      })
    },
    rejectFn (files) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('Failed to solve promise - Test'))
        }, 2000)
      })
    }
  }
}
</script>
