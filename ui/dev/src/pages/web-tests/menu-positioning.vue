<template>
  <div>
    <div class="q-ma-md">
      Space above
      <div style="height: 330px"></div>
    </div>

    <q-menu
      v-if="target !== null"
      :target="target"
      ref="menu"
      :auto-close="false"
      anchor="bottom left"
      self="top left"
    >
      <div class="q-ma-lg">Wide content wide content wide content wide content wide content wide content</div>
      <div class="q-ma-lg">Wide content wide content wide content wide content wide content wide content</div>
      <template v-if="showContent">
        <div v-for="i in 10" :key="i" class="q-ma-lg">Wide content wide content wide content wide content wide content wide content</div>
      </template>
    </q-menu>

    <div class="q-ma-md row q-gutter-md">
      <q-btn
        label="Notify"
        color="primary"
        @click="notify"
      />

      <q-btn
        label="Reset"
        color="primary"
        @click="showContent = false"
      />
    </div>

    <div
      style="width: 70vw"
      class="inline-block"
    ></div>
    <div
      class="q-ma-md inline-block"
      ref="target"
    >
      Running Quasar v{{ version }}
    </div>

    <div style="height: 200px"></div>
    Space below
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      version: 1,
      showContent: false,
      target: null
    }
  },
  methods: {
    notify: function () {
      this.target = this.$refs.target
      this.$nextTick(() => {
        this.$refs.menu.show()

        setTimeout(() => {
          this.showContent = true
        }, 150)
      })
    }
  }
}
</script>
