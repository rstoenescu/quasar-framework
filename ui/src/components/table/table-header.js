import QCheckbox from '../checkbox/QCheckbox.js'
import QTh from './QTh.js'

import cache from '../../utils/cache.js'

export default {
  computed: {
    headerSelectedValue () {
      return this.someRowsSelected === true
        ? null
        : this.allRowsSelected
    }
  },

  methods: {
    __getTHead (h) {
      const child = this.__getTHeadTR(h)

      if (this.loading === true && this.$scopedSlots.loading === void 0) {
        child.push(
          h('tr', { staticClass: 'q-table__progress' }, [
            h('th', {
              staticClass: 'relative-position',
              attrs: { colspan: this.computedColspan }
            }, this.__getProgress(h))
          ])
        )
      }

      return h('thead', child)
    },

    __getTHeadTR (h) {
      const
        header = this.$scopedSlots.header,
        headerCell = this.$scopedSlots['header-cell']

      if (header !== void 0) {
        return header(
          this.__getHeaderScope({ header: true })
        ).slice()
      }

      const child = this.computedCols.map(col => {
        const
          headerCellCol = this.$scopedSlots[`header-cell-${col.name}`],
          slot = headerCellCol !== void 0 ? headerCellCol : headerCell,
          props = this.__getHeaderScope({ col })

        return slot !== void 0
          ? slot(props)
          : h(QTh, {
            key: col.name,
            props: { props }
          }, col.label)
      })

      if (this.singleSelection === true && this.grid !== true) {
        child.unshift(h('th', { staticClass: 'q-table--col-auto-width' }, [' ']))
      }
      else if (this.multipleSelection === true) {
        const slot = this.$scopedSlots['header-selection']
        const content = slot !== void 0
          ? slot(this.__getHeaderScope({}))
          : [
            h(QCheckbox, {
              props: {
                color: this.color,
                value: this.headerSelectedValue,
                dark: this.dark,
                dense: this.dense
              },
              on: cache(this, 'inp', {
                input: this.__onMultipleSelectionSet
              })
            })
          ]

        child.unshift(
          h('th', { staticClass: 'q-table--col-auto-width' }, content)
        )
      }

      return [
        h('tr', {
          style: this.tableHeaderStyle,
          class: this.tableHeaderClass
        }, child)
      ]
    },

    __getHeaderScope (data) {
      Object.assign(data, {
        cols: this.computedCols,
        sort: this.sort,
        colsMap: this.computedColsMap,
        color: this.color,
        dark: this.dark,
        dense: this.dense
      })

      if (this.multipleSelection === true) {
        Object.defineProperty(data, 'selected', {
          get: () => this.headerSelectedValue,
          set: this.__onMultipleSelectionSet,
          configurable: true,
          enumerable: true
        })

        // TODO: remove in v2
        data.partialSelected = this.someRowsSelected
        data.multipleSelect = true
      }

      return data
    },

    __onMultipleSelectionSet (val) {
      if (this.someRowsSelected === true) {
        val = false
      }
      this.__updateSelection(
        this.computedRows.map(this.getRowKey),
        this.computedRows,
        val
      )
    }
  }
}
