<template>
  <div class="window-title" v-if="!IsUseSysTitle && isNotMac && !IsWeb">
    <!-- 软件logo预留位置 -->
    <div class="logo">
      <img
        src="@renderer/assets/icons/svg/electron-logo.svg"
        class="icon-logo"
      />
    </div>
    <!-- 菜单栏位置 -->
    <div flex justify-between items-center style="width: calc(100vw - 200px)">
      <sys-menu-bar />
      <sys-bar-tips flex-1/>
    </div>
    <!-- 中间标题位置 -->
    <div class="title"></div>
  </div>
  <div v-else-if="!IsUseSysTitle && !isNotMac" class="window-title" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SysMenuBar from "@renderer/components/sys-menu-bar/index.vue";
const { ipcRendererChannel, systemInfo } = window

const IsUseSysTitle = ref(false)
const mix = ref(false)
const isNotMac = ref(false)
const IsWeb = ref(Boolean(__ISWEB__))

isNotMac.value = systemInfo.platform !== 'darwin'

ipcRendererChannel.IsUseSysTitle.invoke().then((res) => {
  IsUseSysTitle.value = res
})
</script>

<style lang="scss" scoped>
.window-title {
  width: 100%;
  height: 31px;
  line-height: 30px;
  background-color: rgb(var(--sys-bar-background));
  display: flex;
  //-webkit-app-region: drag;
  position: fixed;
  top: 0;
  z-index: 99999;

  .icon-logo {
    width: 1em;
    height: 1em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
  }

  .title {
    text-align: center;
    color: #9d9d9d;
    -webkit-app-region: drag;
    flex: 1;
  }

  .logo {
    margin: 0 10px;
    -webkit-app-region: drag;
    user-select: none;
  }

  .controls-container {
    display: flex;
    flex-grow: 0;
    flex-shrink: 0;
    text-align: center;
    position: relative;
    z-index: 3000;
    -webkit-app-region: no-drag;
    height: 100%;
    width: 138px;
    margin-left: auto;

    .windows-icon-bg {
      display: inline-block;
      -webkit-app-region: no-drag;
      height: 100%;
      width: 33.34%;
      color: rgba(129, 129, 129, 0.6);

      .icon-size {
        width: 12px;
        height: 15px;
        vertical-align: -0.15em;
        fill: currentColor;
        overflow: hidden;
      }
    }

    .windows-icon-bg:hover {
      background-color: rgba(182, 182, 182, 0.2);
      color: #333;
    }

    .close-icon:hover {
      background-color: rgba(232, 17, 35, 0.9);
      color: #fff;
    }
  }
}
</style>
