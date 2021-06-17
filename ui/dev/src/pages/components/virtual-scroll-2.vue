<template>
  <q-layout view="lHh LpR fFf">
    <q-page-container>
      <q-page padding>
        <div class="text-h6 q-my-lg q-pa-lg bg-grey-10 text-white" style="height: 500px">
          Before list
        </div>
        <q-virtual-scroll component="q-list" :items="heavyList" separator scroll-target="body">
          <template v-slot="{ item, index }">
            <q-item
              v-if="(index % 3) === 0"
              :key="index"
              clickable
            >
              <q-item-section>
                <q-item-label class="q-px-xl">
                  Option - {{ item.label }} #{{ index }}
                </q-item-label>
              </q-item-section>
            </q-item>
            <q-banner v-else-if="(index % 5) === 0" class="bg-negative" :key="index">
              <template v-slot:avatar>
                <q-avatar square color="warning" text-color="negative">
                  {{ item.value }}
                </q-avatar>
              </template>
              {{ item.label }} #{{ index }}
            </q-banner>
            <div v-else class="bg-yellow text-black q-py-lg text-center scroll" :key="index" style="max-height: 100px">
              {{ item.label }} #{{ index }}
            </div>
          </template>
        </q-virtual-scroll>
        <div class="text-h6 q-my-lg q-pa-lg bg-grey-10 text-white" style="height: 800px">
          After list
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
const heavyList = []

for (let i = 0; i < 100000; i++) {
  heavyList.push({
    label: 'Option ' + (i + 1),
    html: 'Option <em class="text-h6">' + (i + 1) + '</em>',
    value: Math.trunc(1 + Math.random() * 99)
  })
}

Object.freeze(heavyList)

export default {
  data () {
    return {
      heavyList
    }
  }
}
</script>
