<template>
  <title-bar />
  <div class="main" h-full>
    <router-view v-slot="{ Component }">
      <component :is="Component" />
    </router-view>
  </div>
</template>

<script setup lang="ts">
import TitleBar from '@renderer/components/title-bar/title-bar.vue'
import useSettingsStore from "@store/settings";
import {onMounted} from "vue";
const settingsStore = useSettingsStore()
onMounted(() => {
  settingsStore.updateSystemBar()
})
</script>

<style scoped>
.main {
  padding-top: 30px;
  box-sizing: border-box;
}
</style>
