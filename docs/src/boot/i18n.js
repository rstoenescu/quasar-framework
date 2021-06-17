import Vue from "vue"
import VueI18n from "vue-i18n"
// let's say we have a file in /src/i18n containing the language pack
import messages from "src/i18n"

// we tell Vue to use our Vue package:
Vue.use(VueI18n)

export default ({ app }) => {
  // Set i18n instance on app;
  // We inject it into root component by doing so;
  // new Vue({..., i18n: ... }).$mount(...)
  app.i18n = new VueI18n({
    locale: "en",
    fallbackLocale: "en",
    messages
  })
}
