<script setup lang="ts">

import { Codemirror } from "vue-codemirror";
import { vue } from '@codemirror/lang-vue'
import { oneDark } from '@codemirror/theme-one-dark'
import {ref} from "vue";
const code = ref('')
Array.from({length: 50}).forEach(_ => code.value += '\n')

</script>

<template>
  <div>
    <codemirror
      v-model="code"
      :extensions="[vue(), oneDark]"
      :style="{height: '100%'}"
    />
  </div>
</template>

<style scoped lang="scss">

</style>
