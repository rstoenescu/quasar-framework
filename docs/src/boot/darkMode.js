import { Cookies } from 'quasar'

export default function ({ store, ssrContext }) {
  const cookies = process.env.SERVER
    ? Cookies.parseSSR(ssrContext)
    : Cookies

  if (cookies.has('dark')) {
    store.commit('updateDarkMode', true)
  }
}
