<template>
  <div class="docs-ripple row justify-center">
    <div style="width: 500px; max-width: 90vw; padding: 70vh 0">
      <p class="caption">
        <span class="desktop-only">Click</span>
        <span class="mobile-only">Tap</span>
        on the area below to see it in action.
      </p>
      <q-toggle v-model="early" label="Trigger early" />

      <div
        v-ripple="rippleBaseConfig"
        tabindex="0"
        class="relative-position ripple-example bg-white text-black flex flex-center"
        style="height: 150px; border-radius: 50px"
      >
        <div class="q-pa-xl bg-grey-2">Touch target test</div>
      </div>

      <div
        v-ripple="rippleBaseConfig"
        tabindex="0"
        class="relative-position ripple-example bg-primary"
        style="height: 150px"
      />

      <div
        v-ripple="rippleBaseConfig"
        tabindex="0"
        class="relative-position ripple-example bg-white text-black"
        style="height: 50px"
      />

      <div
        v-ripple="rippleBaseConfig"
        tabindex="0"
        class="relative-position ripple-example bg-cyan"
        style="height: 50px"
      />

      <div
        v-ripple:primary="rippleBaseConfig"
        tabindex="0"
        class="relative-position ripple-example bg-white text-black"
        style="height: 50px"
      >
        Primary colored ripple
      </div>

      <div
        v-ripple="{ ...rippleBaseConfig, color: 'yellow' }"
        tabindex="0"
        class="relative-position ripple-example bg-cyan"
        style="height: 50px"
      >
        Yellow colored ripple
      </div>

      <div class="row items-center justify-around q-mt-md">
        <div
          tabindex="0"
          v-ripple.center="rippleBaseConfig"
          class="relative-position ripple-example bg-white text-black ripple-round"
        >
          Center
        </div>

        <div
          tabindex="0"
          v-ripple="rippleBaseConfig"
          class="relative-position ripple-example bg-white text-black ripple-round"
        >
          Touch point
        </div>

        <div
          tabindex="0"
          v-ripple.center="rippleBaseConfig"
          class="q-ml-sm relative-position ripple-example bg-cyan ripple-round"
        >
          Center
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      early: false
    }
  },

  computed: {
    rippleBaseConfig () {
      return this.early === true ? { early: true } : {}
    }
  }
}
</script>

<style lang="stylus">
.ripple-example
  border-radius 3px
  cursor pointer
  color white
  display flex
  align-items center
  justify-content center
  user-select none

  &:focus
    outline 1px solid $grey
    outline-offset 3px

  & + &
    margin-top 24px

.ripple-round
  width 150px
  height 150px
  border-radius 50%
  margin-top 0 !important
</style>
