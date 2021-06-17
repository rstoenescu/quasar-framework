import QCheckbox from '../checkbox/QCheckbox.js'

export default {
  methods: {
    __getTBodyTR (h, row, bodySlot, pageIndex) {
      const
        key = this.getRowKey(row),
        selected = this.isRowSelected(key)

      if (bodySlot !== void 0) {
        return bodySlot(
          this.__getBodyScope({
            key,
            row,
            pageIndex,
            __trClass: selected ? 'selected' : ''
          })
        )
      }

      const
        bodyCell = this.$scopedSlots['body-cell'],
        child = this.computedCols.map(col => {
          const
            bodyCellCol = this.$scopedSlots[`body-cell-${col.name}`],
            slot = bodyCellCol !== void 0 ? bodyCellCol : bodyCell

          return slot !== void 0
            ? slot(this.__getBodyCellScope({ key, row, pageIndex, col }))
            : h('td', {
              class: col.__tdClass(row),
              style: col.__tdStyle(row)
            }, this.getCellValue(col, row))
        })

      if (this.hasSelectionMode === true) {
        const slot = this.$scopedSlots['body-selection']
        const content = slot !== void 0
          ? slot(this.__getBodySelectionScope({ key, row, pageIndex }))
          : [
            h(QCheckbox, {
              props: {
                value: selected,
                color: this.color,
                dark: this.dark,
                dense: this.dense
              },
              on: {
                input: (adding, evt) => {
                  this.__updateSelection([ key ], [ row ], adding, evt)
                }
              }
            })
          ]

        child.unshift(
          h('td', { staticClass: 'q-table--col-auto-width' }, content)
        )
      }

      const data = { key, class: { selected }, on: {} }

      if (this.qListeners['row-click'] !== void 0) {
        data.class['cursor-pointer'] = true
        data.on.click = evt => {
          this.$emit('row-click', evt, row, pageIndex)
        }
      }

      if (this.qListeners['row-dblclick'] !== void 0) {
        data.class['cursor-pointer'] = true
        data.on.dblclick = evt => {
          this.$emit('row-dblclick', evt, row, pageIndex)
        }
      }

      if (this.qListeners['row-contextmenu'] !== void 0) {
        data.class['cursor-pointer'] = true
        data.on.contextmenu = evt => {
          this.$emit('row-contextmenu', evt, row, pageIndex)
        }
      }

      return h('tr', data, child)
    },

    __getTBody (h) {
      const
        body = this.$scopedSlots.body,
        topRow = this.$scopedSlots['top-row'],
        bottomRow = this.$scopedSlots['bottom-row']

      let child = this.computedRows.map(
        (row, pageIndex) => this.__getTBodyTR(h, row, body, pageIndex)
      )

      if (topRow !== void 0) {
        child = topRow({ cols: this.computedCols }).concat(child)
      }
      if (bottomRow !== void 0) {
        child = child.concat(bottomRow({ cols: this.computedCols }))
      }

      return h('tbody', child)
    },

    __getVirtualTBodyTR (h) {
      const body = this.$scopedSlots.body
      return props => this.__getTBodyTR(h, props.item, body, props.index)
    },

    __getBodyScope (data) {
      this.__injectBodyCommonScope(data)

      data.cols = data.cols.map(col => {
        const c = { ...col }
        Object.defineProperty(c, 'value', {
          get: () => this.getCellValue(col, data.row),
          configurable: true,
          enumerable: true
        })
        return c
      })

      return data
    },

    __getBodyCellScope (data) {
      this.__injectBodyCommonScope(data)

      Object.defineProperty(data, 'value', {
        get: () => this.getCellValue(data.col, data.row),
        configurable: true,
        enumerable: true
      })

      return data
    },

    __getBodySelectionScope (data) {
      this.__injectBodyCommonScope(data)
      return data
    },

    __injectBodyCommonScope (data) {
      Object.assign(data, {
        cols: this.computedCols,
        colsMap: this.computedColsMap,
        sort: this.sort,
        rowIndex: this.firstRowIndex + data.pageIndex,
        color: this.color,
        dark: this.dark,
        dense: this.dense
      })

      this.hasSelectionMode === true && Object.defineProperty(data, 'selected', {
        get: () => this.isRowSelected(data.key),
        set: (adding, evt) => {
          this.__updateSelection([ data.key ], [ data.row ], adding, evt)
        },
        configurable: true,
        enumerable: true
      })

      Object.defineProperty(data, 'expand', {
        get: () => this.isRowExpanded(data.key),
        set: adding => {
          this.__updateExpanded(data.key, adding)
        },
        configurable: true,
        enumerable: true
      })
    },

    getCellValue (col, row) {
      const val = typeof col.field === 'function' ? col.field(row) : row[col.field]
      return col.format !== void 0 ? col.format(val, row) : val
    }
  }
}
