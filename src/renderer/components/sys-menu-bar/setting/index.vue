<script setup lang="ts">

import {onMounted, reactive, ref} from "vue";
import useSettingsStore from "@store/settings";

const carRef = ref(null)
const menus = reactive([
  {name: '外观', icon: 'theme'},
  {name: '配置管理', icon: 'config'},
  {name: '文件管理', icon: 'file'},
  {name: '数据管理', icon: 'database'},
  {name: '权限管理', icon: 'auth'},
  {name: '其他', icon: 'soft'},
])

const theme = reactive({
  light: {
    background: '255 255 255',
    color: '51 51 51',
    border: '242 242 242',
    panel: '255 255 255',
    "background-hover": '241 241 241'
  },
  dark: {
    background: '51 51 51',
    color: '255 255 255',
    border: '30 31 34',
    panel: '30 31 34',
    "background-hover": '46 67 110'
  },
  purple: {
    background: '196 183 215',
    color: '51 51 51',
    border: '187 176 207',
    panel: '245 245 245',
    "background-hover": '237 232 239'
  },
  yellow: {
    background: '238 232 213',
    color: '51 51 51',
    border: '212 212 212',
    panel: '253 246 227',
    "background-hover": '223 202 136'
  },
  blue: {
    background: '17 34 51',
    color: '255 255 255',
    border: '14 44 69',
    panel: '1 22 39',
    "background-hover": '40 52 64'
  }
})

function handleOpen(val: any) {
  carRef.value.setActiveItem(val)
}
const settingsStore = useSettingsStore()
const activeTheme = ref('light')
function setTheme(key: any, val: any) {
  activeTheme.value = key
  localStorage.setItem('sys.bar.theme',  key)
  settingsStore.setSystemBar(val)
}

onMounted(() => {
  activeTheme.value = localStorage.getItem('sys.bar.theme') || 'light'
})
</script>

<template>
  <div flex items-start justify-center w-full h-full pt-30px>
    <div style="width: 150px;height: calc(70vh - 100px)" mr-10px flex justify-start items-start h-full>
      <el-menu
        default-active="2"
        class="el-menu-vertical-demo"
        @select="handleOpen"
      >
        <el-menu-item :index="index" v-for="(item, index) in menus" :key="index">
          <fa-icon :name="item.icon" class="text-gray-500" size="4"/>
          <span pl-10px>{{ item.name }}</span>
        </el-menu-item>
      </el-menu>
    </div>
    <el-carousel
      ref="carRef"
      height="calc(70vh - 100px)"
      style="width: calc(100% - 200px)"
      direction="vertical"
      :autoplay="false"
    >
      <el-carousel-item v-for="(item, index) in menus" :key="item" :name="index" pt-8px>
        <div v-if="index === 0" pl-5px>
          <div pb-10px>
            系统栏
          </div>
          <div class="system-theme"
               v-for="(val, key) in theme" :key="key"
               flex flex-col rounded-5px overflow-hidden w-100px float-left mr-20px mb-20px
               style="box-shadow: 0 0 5px #ddd;"
               @click="setTheme(key, val)"
          >
            <div flex items-center justify-between pr-5px h-20px w-100px text-8px line-height-20px
                 :style="{'border-bottom': `1px solid rgb(${val.border})`, background: `rgb(${val.background})`, color: `rgb(${val.color})`}">
              <span pl-5px>菜单</span>
              <fa-icon name="close" size="3"/>
            </div>
            <div w-100px h-80px flex items-center justify-center :style="{'background': `rgb(${val.background})`}">
              <div v-if="key === activeTheme" flex items-center justify-center rounded-23px w-23px h-23px bg-green mb-15px>
                <fa-icon name="yes" color="white" />
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          {{ item.name }}
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-menu) {
  border: 0;
  width: 100%;

  .el-menu-item {
    height: 40px;
    border-radius: 5px;
    overflow: hidden;
  }
}

.system-theme{
  cursor: pointer;
  transition: .15s;
  &:hover{
    transform: scale(1.05);
  }
  &:active{
    transform: scale(.95);
  }
}
:deep(.el-carousel__indicators) {
  display: none;
}
</style>
