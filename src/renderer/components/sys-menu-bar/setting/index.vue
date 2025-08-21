<script setup lang="ts">

import {reactive, ref} from "vue";

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
    background: '#fff',
    color: '#333',
    border: '#F2F2F2',
  },
  dark: {
    background: '#333',
    color: '#fff',
    border: '#1E1F22',
  }
})

function handleOpen(val: any) {
  carRef.value.setActiveItem(val)
}
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
               flex flex-col rounded-5px overflow-hidden w-100px float-left mr-20px
               style="box-shadow: 0 0 5px #ddd;"
          >
            <div flex items-center justify-between pr-5px h-20px w-100px text-8px line-height-20px
                 :style="{'border-bottom': `1px solid ${val.border}`, background: val.background, color: val.color}">
              <span pl-5px>菜单</span>
              <fa-icon name="close" size="3"/>
            </div>
            <div w-100px h-80px :style="{'background': val.background}"/>
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
</style>
