<template>
  <div class="q-pa-md">
    <div class="q-gutter-md row">
      <div class="row items-start shadow-2">
        <q-date
          ref="start"
          v-model="selectedDates"
          range
          :default-year-month="defaultYMStart"
          :navigation-min-year-month="selectionStarted ? defaultYMStart : void 0"
          :navigation-max-year-month="selectionStarted ? defaultYMStart : void 0"
          minimal
          flat
          @navigation="(yearMonth) => { syncCalendars('start', yearMonth) }"
          @range-start="onSelectionStart"
          @range-change="onSelectionChange"
          @range-end="onSelectionEnd"
        />

        <q-date
          ref="end"
          v-model="selectedDates"
          range
          :default-year-month="defaultYMEnd"
          :navigation-min-year-month="selectionStarted ? defaultYMEnd : void 0"
          :model-navigation="false"
          minimal
          flat
          @navigation="(yearMonth) => { syncCalendars('end', yearMonth) }"
          @range-start="onSelectionStart"
          @range-change="onSelectionChange"
          @range-end="onSelectionEnd"
        />
      </div>
    </div>
  </div>
</template>

<script>
const ym2hash = ({ year, month }) => `${year}/${month > 9 ? '' : '0'}${month}`

export default {
  data () {
    return {
      defaultYMStart: '2020/03',
      defaultYMEnd: '2020/04',

      selectedDates: null,

      selectionStarted: false
    }
  },

  methods: {
    onSelectionStart (from) {
      this.selectionStarted = true

      this.defaultYMStart = ym2hash(from)
      this.defaultYMEnd = ym2hash({
        year: from.month === 12 ? from.year + 1 : from.year,
        month: from.month === 12 ? 1 : from.month + 1
      })

      this.$refs.start.setEditingRange(from, from)
      this.$refs.end.setEditingRange(from, from)
    },

    onSelectionChange ({ from, to }) {
      this.$refs.start.setEditingRange(from, to, 'from')
      this.$refs.end.setEditingRange(from, to, 'to')
    },

    onSelectionEnd () {
      this.selectionStarted = false

      this.$refs.start.setEditingRange()
      this.$refs.end.setEditingRange()
    },

    syncCalendars (selectionEnd, yearMonth) {
      if (selectionEnd === 'start') {
        const start = ym2hash(yearMonth)

        if (this.selectionStarted !== true) {
          this.defaultYMStart = start
        }

        if (start >= this.defaultYMEnd) {
          const end = ym2hash({
            year: yearMonth.month === 12 ? yearMonth.year + 1 : yearMonth.year,
            month: yearMonth.month === 12 ? 1 : yearMonth.month + 1
          })

          if (this.selectionStarted !== true) {
            this.defaultYMEnd = end
          }

          this.$refs.end.setCalendarTo(...end.split('/'))
        }
      }
      else if (selectionEnd === 'end') {
        const end = ym2hash(yearMonth)

        if (this.selectionStarted !== true) {
          this.defaultYMEnd = end
        }

        if (this.defaultYMStart >= end) {
          const start = ym2hash({
            year: yearMonth.month === 1 ? yearMonth.year - 1 : yearMonth.year,
            month: yearMonth.month === 1 ? 12 : yearMonth.month - 1
          })

          if (this.selectionStarted !== true) {
            this.defaultYMEnd = start
          }

          this.$refs.start.setCalendarTo(...start.split('/'))
        }
      }
    }
  }
}
</script>
