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

      <ul style="max-width: 350px">
        <li>Click once to start selection mode</li>
        <li>Click again to select the range</li>
        <li>The selected range must be at least 3 days and at most 14 days</li>
      </ul>
    </div>
  </div>
</template>

<script>
import { date } from 'quasar'

const { addToDate, formatDate } = date
const ym2hash = ({ year, month }) => `${year}/${month > 9 ? '' : '0'}${month}`
const date2hash = ({ year, month, day }) => `${year}/${month > 9 ? '' : '0'}${month}/${day > 9 ? '' : '0'}${day}`

export default {
  data () {
    return {
      defaultYMStart: '2020/03',
      defaultYMEnd: '2020/04',

      selectedDates: null,

      selectionStarted: false,

      selectionMin: null,
      selectionMax: null
    }
  },

  methods: {
    onSelectionStart (from) {
      this.selectionStarted = date2hash(from)

      this.defaultYMStart = ym2hash(from)
      this.defaultYMEnd = ym2hash({
        year: from.month === 12 ? from.year + 1 : from.year,
        month: from.month === 12 ? 1 : from.month + 1
      })

      const selectionMin = formatDate(addToDate(date2hash(from), { days: 2 }), 'YYYY/MM/DD')

      this.selectionMin = selectionMin
      this.selectionMax = formatDate(addToDate(date2hash(from), { days: 13 }), 'YYYY/MM/DD')

      const toSplit = selectionMin.split('/')
      const to = { year: toSplit[0], month: toSplit[1], day: toSplit[2] }

      this.$refs.start.setEditingRange(from, to)
      this.$refs.end.setEditingRange(from, to)
    },

    onSelectionChange ({ from, to }) {
      if (date2hash(to) < this.selectionMin) {
        const toSplit = this.selectionMin.split('/')
        to = { year: toSplit[0], month: toSplit[1], day: toSplit[2] }
      }
      else if (date2hash(to) > this.selectionMax) {
        const toSplit = this.selectionMax.split('/')
        to = { year: toSplit[0], month: toSplit[1], day: toSplit[2] }
      }

      this.$refs.start.setEditingRange(from, to, 'from')
      this.$refs.end.setEditingRange(from, to, 'to')
    },

    onSelectionEnd ({ from, to }) {
      if (date2hash(to) === this.selectionStarted) {
        const tmp = to
        to = from
        from = tmp
      }

      if (date2hash(to) < this.selectionMin) {
        this.selectedDates = { from: date2hash(from), to: this.selectionMin }
      }
      else if (date2hash(to) > this.selectionMax) {
        this.selectedDates = { from: date2hash(from), to: this.selectionMax }
      }

      this.selectionStarted = false

      this.$refs.start.setEditingRange()
      this.$refs.end.setEditingRange()
    },

    syncCalendars (selectionEnd, yearMonth) {
      if (selectionEnd === 'start') {
        const start = ym2hash(yearMonth)

        if (this.selectionStarted === false) {
          this.defaultYMStart = start
        }

        if (start >= this.defaultYMEnd) {
          const end = ym2hash({
            year: yearMonth.month === 12 ? yearMonth.year + 1 : yearMonth.year,
            month: yearMonth.month === 12 ? 1 : yearMonth.month + 1
          })

          if (this.selectionStarted === false) {
            this.defaultYMEnd = end
          }

          this.$refs.end.setCalendarTo(...end.split('/'))
        }
      }
      else if (selectionEnd === 'end') {
        const end = ym2hash(yearMonth)

        if (this.selectionStarted === false) {
          this.defaultYMEnd = end
        }

        if (this.defaultYMStart >= end) {
          const start = ym2hash({
            year: yearMonth.month === 1 ? yearMonth.year - 1 : yearMonth.year,
            month: yearMonth.month === 1 ? 12 : yearMonth.month - 1
          })

          if (this.selectionStarted === false) {
            this.defaultYMEnd = start
          }

          this.$refs.start.setCalendarTo(...start.split('/'))
        }
      }
    }
  }
}
</script>
