<template>
  <div class="q-pa-md q-gutter-md">
    <q-btn color="primary" @click="showTextLoading">
      Show Text Loading
    </q-btn>

    <q-card class="bg-grey-3 relative-position card-example">
      <q-card-section class="q-pb-none">
        <div class="text-h6">Lorem Ipsum</div>
      </q-card-section>

      <q-card-section>
        <transition
          appear
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
        >
          <div v-show="showSimulatedReturnData">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vel magna eu risus laoreet tristique. Nulla ut fermentum elit, nec consequat augue. Morbi et dolor nec metus tincidunt pellentesque. Nullam non semper ante. Fusce pellentesque sagittis felis quis porta. Aenean condimentum neque sed erat suscipit malesuada. Nulla eget rhoncus enim. Duis dictum interdum eros.
          </div>
        </transition>
      </q-card-section>

      <q-inner-loading :showing="visible" label="Fetching data..." label-color="primary" />
    </q-card>
  </div>
</template>

<script>
// Don't forget to specify which animations
// you are using in quasar.conf.js > animations.
// Alternatively, if using UMD, load animate.css from CDN.
export default {
  data () {
    return {
      visible: false,
      showSimulatedReturnData: false
    }
  },

  methods: {
    showTextLoading () {
      this.visible = true
      this.showSimulatedReturnData = false
      setTimeout(() => {
        this.visible = false
        this.showSimulatedReturnData = true
      }, 3000)
    }
  }
}
</script>

<style lang="sass" scoped>
.card-example
  width: 288px
  height: 290px
</style>
