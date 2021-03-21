<template>
  <div class="q-pa-md column no-wrap q-gutter-y-md" style="max-width: 500px">
    <q-btn color="black" label="First focusable element" />

    <!-- QEditor already uses the keyboard navigation inside -->
    <q-editor v-model="editor" min-height="5rem" />

    <!-- QDate already uses the keyboard navigation inside -->
    <q-date v-model="date" />

    <q-btn color="black" label="Last focusable element" />
  </div>
</template>

<script>
export default {
  data () {
    return {
      editor: 'What you see is <b>what</b> you get.',
      date: '2019/02/01'
    }
  }
}
</script>
