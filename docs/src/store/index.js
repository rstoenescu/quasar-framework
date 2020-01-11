import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation
 */

export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    state: {
      leftDrawerState: false,
      rightDrawerState: false,
      toc: [],
      dark: false
    },

    mutations: {
      updateLeftDrawerState (state, opened) {
        state.leftDrawerState = opened
      },

      updateRightDrawerState (state, opened) {
        state.rightDrawerState = opened
      },

      updateToc (state, newToc) {
        state.toc = newToc.length > 0
          ? [ { id: 'Introduction', title: 'Introduction' } ].concat(newToc)
          : []
      },

      updateDarkMode (state, darkMode) {
        state.dark = darkMode
      }
    }
  })

  return Store
}
