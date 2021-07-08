<template>
  <div>
    <div class="q-layout-padding">
      <p class="caption">
        Scroll down to see it in action.
      </p>

      <div class="row justify-between">
        <q-toggle v-model="disable" label="Disable" class="q-mr-sm" />
        <q-select v-model="direction" :options="directionOptions" label="Direction" dense style="width: 250px;" />
      </div>

      <div ref="scrollTarget" :style="styles">
        <q-infinite-scroll @load="loadRef" :disable="disable" :direction="direction" v-if="active" :scroll-target="container ? $refs.scrollTarget : void 0">
          <div v-for="(item, index) in itemsRef" :key="index" class="caption">
            <q-chip square color="secondary" class="shadow-1">
              {{ index + 1 }}
            </q-chip>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </div>

          <div slot="loading" class="row justify-center q-my-md">
            <q-spinner color="primary" name="dots" :size="40" />
          </div>
        </q-infinite-scroll>
        <div v-else style="height: 300vh">
          Placeholder for scroll
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      itemsReverse: [{}, {}, {}, {}, {}],
      itemsRef: [{}, {}, {}, {}, {}, {}],
      itemsId: [{}, {}, {}, {}, {}],
      disable: false,
      container: false,
      active: true,
      direction: 'both',
      directionOptions: [null, 'bottom', 'top', 'both', 'none']
    }
  },
  computed: {
    styles () {
      return this.container ? 'height: 300px; border: 1px solid black; overflow: auto;' : ''
    }
  },
  methods: {
    loadReverse (index, done) {
      console.log('load reverse called')
      setTimeout(() => {
        this.itemsReverse.splice(0, 0, {}, {}, {}, {}, {}, {}, {})
        done()
      }, 2500)
    },

    loadRef (index, done, direction) {
      console.log('load ref called', direction)
      setTimeout(() => {
        this.itemsRef.push({}, {}, {}, {}, {}, {}, {})
        done()
      }, 2500)
    },

    loadId (index, done) {
      console.log('load id called')
      setTimeout(() => {
        this.itemsId.push({}, {}, {}, {}, {}, {}, {})
        done()
      }, 2500)
    }
  }
}
</script>
