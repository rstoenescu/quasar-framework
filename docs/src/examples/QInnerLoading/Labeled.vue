<template>
  <div class="q-pa-md q-gutter-md">
    <q-card class="bg-grey-3 relative-position card-example">
      <q-inner-loading showing>
        <q-spinner-gears size="50px" color="primary" />
        <span>Loading ...</span>
      </q-inner-loading>
    </q-card>
  </div>
</template>

<script>
// Don't forget to specify which animations
// you are using in quasar.conf.js > animations.
// Alternatively, if using UMD, load animate.css from CDN.
export default {}
</script>

<style lang="sass" scoped>
.card-example
  width: 288px
  height: 290px
</style>
