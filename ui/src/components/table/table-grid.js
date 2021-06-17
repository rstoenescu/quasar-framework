import QCheckbox from '../checkbox/QCheckbox.js'
import QSeparator from '../separator/QSeparator.js'

export default {
  methods: {
    __getGridHeader (h) {
      const child = this.gridHeader === true
        ? [
          h('table', { staticClass: 'q-table' }, [
            this.__getTHead(h)
          ])
        ]
        : (
          this.loading === true && this.$scopedSlots.loading === void 0
            ? this.__getProgress(h)
            : void 0
        )

      return h('div', { staticClass: 'q-table__middle' }, child)
    },

    __getGridBody (h) {
      const item = this.$scopedSlots.item !== void 0
        ? this.$scopedSlots.item
        : scope => {
          const child = scope.cols.map(
            col => h('div', { staticClass: 'q-table__grid-item-row' }, [
              h('div', { staticClass: 'q-table__grid-item-title' }, [ col.label ]),
              h('div', { staticClass: 'q-table__grid-item-value' }, [ col.value ])
            ])
          )

          if (this.hasSelectionMode === true) {
            const slot = this.$scopedSlots['body-selection']
            const content = slot !== void 0
              ? slot(scope)
              : [
                h(QCheckbox, {
                  props: {
                    value: scope.selected,
                    color: this.color,
                    dark: this.dark,
                    dense: this.dense
                  },
                  on: {
                    input: (adding, evt) => {
                      this.__updateSelection([ scope.key ], [ scope.row ], adding, evt)
                    }
                  }
                })
              ]

            child.unshift(
              h('div', { staticClass: 'q-table__grid-item-row' }, content),
              h(QSeparator, { props: { dark: this.dark } })
            )
          }

          const data = {
            staticClass: 'q-table__grid-item-card' + this.cardDefaultClass,
            class: this.cardClass,
            style: this.cardStyle,
            on: {}
          }

          if (this.qListeners['row-click'] !== void 0 || this.qListeners['row-dblclick'] !== void 0) {
            data.staticClass += ' cursor-pointer'
          }

          if (this.qListeners['row-click'] !== void 0) {
            data.on.click = evt => {
              this.$emit('row-click', evt, scope.row, scope.pageIndex)
            }
          }

          if (this.qListeners['row-dblclick'] !== void 0) {
            data.on.dblclick = evt => {
              this.$emit('row-dblclick', evt, scope.row, scope.pageIndex)
            }
          }

          return h('div', {
            staticClass: 'q-table__grid-item col-xs-12 col-sm-6 col-md-4 col-lg-3',
            class: scope.selected === true ? 'q-table__grid-item--selected' : ''
          }, [
            h('div', data, child)
          ])
        }

      return h('div', {
        staticClass: 'q-table__grid-content row',
        class: this.cardContainerClass,
        style: this.cardContainerStyle
      }, this.computedRows.map((row, pageIndex) => {
        return item(this.__getBodyScope({
          key: this.getRowKey(row),
          row,
          pageIndex
        }))
      }))
    }
  }
}
