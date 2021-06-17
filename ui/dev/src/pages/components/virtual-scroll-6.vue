<template>
  <q-layout view="lHh LpR fFf">
    <q-page-container>
      <q-page padding class="q-pr-xl">
        <q-virtual-scroll
          ref="virtualListRef"
          type="table"
          style="max-height: 70vh"
          :virtual-scroll-item-size="48"
          :virtual-scroll-sticky-size-start="48"
          :virtual-scroll-sticky-size-end="32"
          :items="heavyList"
          @virtual-scroll="onVirtualScroll"
        >
          <template v-slot:before>
            <thead class="thead-sticky">
              <tr>
                <th v-for="column in columns" :key="column">
                  {{ column }} - thead 1
                </th>
              </tr>
              <tr>
                <th v-for="column in columns" :key="column">
                  {{ column }} - thead 2 - sticky
                </th>
              </tr>
            </thead>
          </template>

          <template v-slot:after>
            <tfoot class="tfoot-sticky">
              <tr>
                <th v-for="column in columns" :key="column">
                  {{ column }} - tfoot 1 - sticky
                </th>
              </tr>
              <tr>
                <th v-for="column in columns" :key="column">
                  {{ column }} - tfoot 2
                </th>
              </tr>
            </tfoot>
          </template>

          <template v-slot="{ item: row, index: rowNr }">
            <tr :key="rowNr" :class="rowNr === listIndex ? 'text-primary' : ''">
              <td v-for="column in columns" :key="column">
                <template v-if="column !== 'col2'">
                  <div>{{ row[column] }}</div>
                  <div v-if="rowNr % 3 === 0">
                    {{ row[column] }} again
                  </div>
                  <div v-if="rowNr % 5 === 0">
                    {{ row[column] }} again again
                  </div>
                </template>
                <q-img v-else :src="row[column].src" :style="setSize ? { height: (2 * row[column].height) + 'px', width: (2 * row[column].width) + 'px' } : void 0" />
              </td>
            </tr>
          </template>
        </q-virtual-scroll>

        <div class="row q-pa-md">
          <div class="col">
            <q-input
              type="number"
              :value="listIndex"
              :min="0"
              :max="listSize"
              :debounce="3000"
              label="Scroll to index"
              input-class="text-right"
              @input="onIndexChange"
            />
          </div>
          <q-toggle v-model="setSize" label="Preset size" />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style lang="stylus">
.thead-sticky tr > *,
.tfoot-sticky tr > *
  position sticky
  opacity 1
  z-index 1
  background-color black
  color white
.thead-sticky tr:last-child > *
  top 0
.tfoot-sticky tr:first-child > *
  bottom 0
</style>

<script>
const
  heavyList = [],
  columns = [],
  listSize = 10000,
  lorem = 'Lorem ipsum lorem ipsum lorem ipsum lorem ip sum Lorem ipsum lorem ipsum lorem ipsum lorem ip sum Lorem ipsum lorem ipsum lorem ipsum lorem ip sum Lorem ipsum lorem ipsum lorem ipsum lorem ip sum Lorem ipsum lorem ipsum lorem ipsum lorem ip sum Lorem ipsum lorem ipsum lorem ipsum lorem ip sum Lorem ipsum lorem ipsum lorem ipsum lorem ip sum Lorem ipsum lorem ipsum lorem ipsum lorem ip sumLorem ipsum lorem ipsum lorem ipsum lorem ip sum Lorem ipsum lorem ipsum lorem ipsum lorem ip sum Lorem ipsum lorem ipsum lorem ipsum lorem ip sum Lorem ipsum lorem ipsum lorem ipsum lorem ip sum'
const getRandomInt = (min, max) => {
  var x = Math.floor(Math.random() * (max - min + 1)) + min
  return Math.ceil(x / 10) * 10
}
for (let i = 0; i < 30; i++) {
  columns.push('col' + (i + 1))
}
for (let i = 0; i <= listSize; i++) {
  const row = {}
  for (let j = 0; j < columns.length; j++) {
    row[columns[j]] = '#' + i + ' row ' + (i + 1) + ' / col ' + (j + 1)
    if (j === 2) {
      row[columns[j]] += ' - ' + lorem
    }
    else if (j === 1) {
      const
        width = getRandomInt(100, 150),
        height = getRandomInt(150, 350)
      row[columns[j]] = {
        src: 'https://www.fillmurray.com/' + width + '/' + height + '?ver=' + j,
        width,
        height
      }
    }
  }
  heavyList.push(row)
}
Object.freeze(heavyList)
export default {
  data () {
    return {
      heavyList,
      columns,
      listSize,
      listIndex: 8200,
      setSize: false
    }
  },
  methods: {
    onIndexChange (index) {
      this.$refs.virtualListRef.scrollTo(index)
    },
    onVirtualScroll ({ index }) {
      this.listIndex = index
    }
  },
  mounted () {
    this.$refs.virtualListRef.scrollTo(this.listIndex)
  }
}
</script>
