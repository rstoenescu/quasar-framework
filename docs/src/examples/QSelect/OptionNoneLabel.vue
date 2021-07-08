<template>
  <div class="q-pa-md" style="max-width: 300px">
    <div class="q-gutter-md">
      <q-select
        filled
        v-model="model"
        :options="options"
        label="No options"
        no-option-label="Sorry, there are no options to show..."
      />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      model: null,
      options: []
    };
  }
};
</script>
