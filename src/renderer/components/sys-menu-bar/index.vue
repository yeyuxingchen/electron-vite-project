<script setup lang="ts">

import {MenuBar, MenuBarOptions, MenuItem} from '@imengyu/vue3-context-menu';
import About from './about/index.vue'
import Setting from './setting/index.vue'
import {computed, reactive} from "vue";
import router from "@renderer/router";

const { ipcRendererChannel } = window

defineOptions({
  name: 'SysMenuBar',
})


// 默认点击处理函数
const defaultClickHandler = () => {
  dialog.nothing = true
};

// 递归处理菜单项
function processMenuItems(items: MenuItem[]): MenuItem[] {
  return items.filter(item => !item.development || process.env.NODE_ENV === 'development').map(item => {
    const processedItem = { ...item };

    // 如果没有onClick事件，则添加默认处理函数
    if (!processedItem.onClick) {
      processedItem.onClick = defaultClickHandler;
    }

    // 递归处理子菜单
    if (processedItem.children) {
      processedItem.children = processMenuItems(processedItem.children);
    }

    return processedItem;
  });
}

const menuData: MenuBarOptions = {
  items: [
    {
      label: "文件",
      children: [
        {label: "New"},
        {label: "Open"},
        {
          label: "Open recent",
          children: [
            {label: "File 1...."},
            {label: "File 2...."},
            {label: "File 3...."},
            {label: "File 4...."},
            {label: "File 5...."},
          ],
        },
        {label: "Save", divided: true},
        {label: "Save as..."},
        {label: "Close"},
        {label: "Exit"},
      ],
    },
    {
      label: "编辑",
      children: [
        {label: "Undo"},
        {label: "Redo"},
        {label: "Cut", divided: true},
        {label: "Copy"},
        {label: "Find", divided: true},
        {label: "Replace"},
      ],
    },
    {
      label: "视图",
      children: [
        {label: "Zoom in"},
        {label: "Zoom out"},
        {label: "Reset zoom"},
        {label: "Full screent", divided: true},
        {label: "Find", divided: true},
        {label: "Replace"},
      ],
    },
    {
      label: '工具',
      children: [
        {
          label: 'Nginx',
          onClick: () => {
            router.push('/tools/nginx')
          }
        }
      ]
    },
    {
      label: "帮助",
      children: [
        {
          label: "控制台",
          onClick: () => {
            ipcRendererChannel.openDevTools.invoke()
          }
        },
        {
          label: "设置",
          development: true,
          onClick: () => {
            dialog.setting = true
          }
        },
        {
          label: "关于",
          onClick: () => {
            dialog.about = true
          }
        },
      ],
    },
  ],
  zIndex: 3,
  minWidth: 230
};

const menuOptions = computed(() => {
  return {...menuData, items: processMenuItems(menuData.items)}
})

const dialog = reactive({
  about: false,
  setting: false,
  nothing: false
})

const propsConfig = {
  about: {
    radius: '5', title: '帮助', width: '400px', height: '200px'
  },
  setting: {
    radius: '5', title: '设置', width: 'calc(100vw - 40vh)', height: '70vh', type: 'black-transparent', top: '11vh'
  },
  nothing: {
    radius: '5', title: '提示', type: 'success', width: '350px', height: '150px'
  }
}


</script>

<template>
  <div style="z-index: 9999">
    <MenuBar :options="menuOptions"/>

    <fa-dialog v-model="dialog.about" v-bind="propsConfig.about">
      <about/>
    </fa-dialog>

    <fa-dialog v-model="dialog.nothing" v-bind="propsConfig.nothing">
      <div flex items-center justify-center font-size-12px h-full>
        什么功能也没有，只是为了凑字数...
      </div>
    </fa-dialog>

    <fa-dialog v-model="dialog.setting" v-bind="propsConfig.setting">
      <setting />
    </fa-dialog>
  </div>
</template>

<style scoped lang="scss">
:deep(.mx-menu-bar) {
  padding: 0;

  .mx-menu-bar-item {
    padding-bottom: 0;
    font-size: 13px;
    padding-top: 2px;
    height: 31px;
  }
}

:global(#mx-menu-default-container) {
  z-index: 3000 !important;
}
</style>
