<template lang="pug">
  q-btn-dropdown.text-bold(:align="align", flat, no-caps, stretch, :label="activeLocaleLabel", auto-close)
    q-list(dense padding)
      q-item.text-bold.justify-center.items-center(
        v-for="locale in availableLocales",
        :key="`locales-list-${locale.name}`",
        :active="$i18n.locale === locale.localeKey",
        clickable,
        @click="changeLocale(locale.localeKey)"
      ) {{ locale.name }}
</template>

<script>
export default {
  data () {
    return {
      availableLocales: [
        { name: "EN", localeKey: "en" },
        { name: "RU", localeKey: "ru" }
      ]
    }
  },
  props: {
    align: {
      type: String
    }
  },
  computed: {
    activeLocaleLabel () {
      return (
        this.availableLocales.find(
          locale => locale.localeKey === this.$i18n.locale
        )?.name || "EN"
      )
    }
  },
  methods: {
    changeLocale (locale) {
      this.$i18n.locale = locale
    }
  }
}
</script>
