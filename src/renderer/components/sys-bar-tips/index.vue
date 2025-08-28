<script setup lang="ts">

import useStoreSystemBar from "@store/system.bar";

defineOptions({
  name: 'SysBarTips',
})

const useSystemBarStore = useStoreSystemBar()
</script>

<template>
  <div w-200px flex justify-end items-center style="-webkit-app-region: drag;">
    <el-tooltip :content="useSystemBarStore.systemBar.content" :effect="useSystemBarStore.systemBar.effect">
      <div flex items-center style="-webkit-app-region: no-drag;">
        <fa-icon :name="useSystemBarStore.systemBar.icon" :size="useSystemBarStore.systemBar.iconSize"/>
        <span font-size-12px>{{useSystemBarStore.systemBar.tips}}</span>
      </div>
    </el-tooltip>
  </div>
</template>

<style scoped lang="scss">

</style>
