export default {
  props: {
    filter: [String, Object],
    filterMethod: {
      type: Function,
      default (rows, terms, cols = this.computedCols, cellValue = this.getCellValue) {
        const lowerTerms = terms ? terms.toLowerCase() : ''
        return rows.filter(
          row => cols.some(col => {
            const strCellValue = (cellValue(col, row)+ '')
            const lowerCellValue = (strCellValue === 'undefined' || strCellValue === 'null') ? '' : strCellValue.toLowerCase()
            return lowerCellValue.indexOf(lowerTerms) !== -1
          })
        )
      }
    }
  },

  watch: {
    filter: {
      handler () {
        this.$nextTick(() => {
          this.setPagination({ page: 1 }, true)
        })
      },
      deep: true
    }
  }
}
