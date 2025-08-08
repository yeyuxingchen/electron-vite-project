<script setup lang="ts">

import TitleBar from "@renderer/components/title-bar/title-bar.vue";
import SoftAside from "@renderer/layouts/components/SoftAside.vue";
</script>

<template>
  <div h-full>
    <title-bar/>
    <div flex h-full style="border: 2.5px solid rgb(242,242,242)">
      <soft-aside />
      <div class="main">
        <RouterView v-slot="{ Component, route }">
          <component :is="Component" :key="route.fullPath"/>
        </RouterView>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

.main {
  flex: 1;
}
</style>
