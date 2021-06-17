<template>
  <q-layout view="lHh LpR fFf">
    <q-page-container>
      <q-page padding class="q-pr-xl">
        <q-virtual-scroll
          ref="virtualListRef"
          type="table"
          class="test-virtual-table--fixed"
          :virtual-scroll-item-size="48"
          :virtual-scroll-sticky-size-start="48"
          :virtual-scroll-sticky-size-end="32"
          table-colspan="30"
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
                <div>{{ row[column] }}</div>
                <div v-if="rowNr % 3 === 0">
                  {{ row[column] }} again
                </div>
                <div v-if="rowNr % 5 === 0">
                  {{ row[column] }} again again
                </div>
              </td>
            </tr>
          </template>
        </q-virtual-scroll>

        <div class="q-pa-md">
          <q-input
            type="number"
            :value="listIndex"
            :min="0"
            :max="listSize"
            label="Scroll to index"
            input-class="text-right"
            @input="onIndexChange"
          />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style lang="stylus">
.test-virtual-table--fixed
  max-height: 70vh

  table
    table-layout: fixed

  th, td
    width: 250px

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
  listSize = 10000

for (let i = 0; i < 30; i++) {
  columns.push('col' + (i + 1))
}

for (let i = 0; i <= listSize; i++) {
  const row = {}

  for (let j = 0; j < columns.length; j++) {
    row[columns[j]] = '#' + i + ' row ' + (i + 1) + ' / col ' + (j + 1)
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
      listIndex: 8200
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
