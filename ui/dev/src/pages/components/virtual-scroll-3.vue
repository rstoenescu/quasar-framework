<template>
  <q-layout view="lHh LpR fFf">
    <q-page-container>
      <q-page padding :style-fn="offset => ({ height: ($q.screen.height - offset) + 'px' })" class="column">
        <div class="text-h6 q-my-lg">
          Virtual list with dynamic generated items ({{ size.toLocaleString() }} items)
        </div>

        <q-virtual-scroll
          class="col"
          component="q-list"
          :items-size="size"
          :items-fn="getItems"
          :virtual-scroll-item-size="5"
          separator
          ref="list"
        >
          <template v-slot="{ item, index }">
            <q-item :key="index">
              <q-item-section avatar>
                <q-avatar :color="item.avatarColor" text-color="white">
                  {{ item.avatarLetter }}
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label>
                  {{ item.label }}
                </q-item-label>
              </q-item-section>

              <q-item-section side top>
                <q-item-label caption>
                  #{{ index }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-virtual-scroll>

        <div class="q-pa-md row justify-between">
          <q-btn label="+1e5" @click="() => { size += 1e5 }" />
          <q-btn label="+1e4" @click="() => { size += 1e4 }" />
          <q-btn label="+1e3" @click="() => { size += 1e3 }" />
          <q-btn label="-1e3" @click="() => { size -= size > 1e3 ? 1e3 : size }" />
          <q-btn label="-1e4" @click="() => { size -= size > 1e4 ? 1e4 : size }" />
          <q-btn label="-1e5" @click="() => { size -= size > 1e5 ? 1e5 : size }" />
          <q-btn label="End" @click="() => { $refs.list.scrollTo(size) }" />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  data () {
    return {
      size: 100
    }
  },

  methods: {
    getItems (from, size) {
      const items = []

      for (let i = 0; i < size; i++) {
        items.push({
          avatarColor: 'red',
          avatarLetter: 'A',
          label: `Item ${from + i + 1}`
        })
      }

      return Object.freeze(items)
    }
  },

  mounted () {
    this.intervalTimer = setInterval(() => {
      this.size += 1
    }, 3000)
  },

  beforeDestroy () {
    clearInterval(this.intervalTimer)
  }
}
</script>
