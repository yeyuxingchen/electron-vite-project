<script setup lang="ts">

import useStoreSystemBar from "@store/system.bar";

defineOptions({
  name: 'SysBarTips',
})

const useSystemBarStore = useStoreSystemBar()
</script>

<template>
  <div w-200px flex justify-end items-center class="draggable">
    <el-tooltip :content="useSystemBarStore.systemBar.content" :effect="useSystemBarStore.systemBar.effect">
      <div flex items-center px-10px rounded-6px class="tooltip-content">
        <fa-icon v-if="useSystemBarStore.systemBar.icon" :name="useSystemBarStore.systemBar.icon"
                 :size="useSystemBarStore.systemBar.iconSize"/>
        <span font-size-14px color-white>{{ useSystemBarStore.systemBar.tips }}</span>
      </div>
    </el-tooltip>
  </div>
</template>

<style scoped lang="scss">
.draggable {
  -webkit-app-region: drag;
}

.tooltip-content {
  -webkit-app-region: no-drag;
  background: #5BC3FFee;
  transform: scale(0.8);
  box-shadow: 3px 3px 5px #5BC3FF55;
  cursor: pointer;
  transition: .25s;
  &:hover {
    box-shadow: 3px 3px 5px rgba(63, 141, 189, 0.5);
  }
  &:active{
    box-shadow: 3px 3px 5px #5BC3FF33;
  }
}
</style>
