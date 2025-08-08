<script setup lang="ts">


const { ipcRendererChannel } = window
import {onMounted, ref} from "vue";

const showDialog = ref(false)

function changeWindowStatus() {
  ipcRendererChannel.fullScreenAndOnTop.invoke()
}

function down() {
  ipcRendererChannel.openDialog.invoke({
    filters: [{name: '全部文件', extensions: ['*']}],
    properties: ['openDirectory']
  }).then(res => {
    console.log(res)
    if (res.filePaths.length > 0) {
      ipcRendererChannel.StartDownload.invoke({
        downloadUrl: 'https://files2.freedownloadmanager.org/6/latest/fdm_x64_setup.exe',
        savePath: res.filePaths[0]
      }).then(() => {
        percentage.value = 0
      })
    }
  })
}

const path = ref('')
function handelForExample() {
  ipcRendererChannel.forExample.invoke().then(res => {
    path.value = res
  })
}

function handelOpenDevTools() {
  ipcRendererChannel.openDevTools.invoke()
}

const percentage = ref(0)
onMounted(() => {
  ipcRendererChannel.DownloadProgress.on((_, arg) => {
    percentage.value = Number(arg)
  })
})

</script>

<template>
  <div pt-13px pl-13px>
    <span underline>
    </span>

    <el-button @click="changeWindowStatus">
      全屏
    </el-button>
    <el-button type="primary" @click="showDialog = true">
      弹窗
    </el-button>
    <el-button @click="down">
      下載
    </el-button>
    <el-button type="primary" plain @click="handelOpenDevTools">
      控制台
    </el-button>
    <el-button type="success" @click="handelForExample">
      测试
    </el-button>
    <el-progress my-30px :status="percentage === 100 ? 'success' : ''" :percentage="percentage" :stroke-width="15" striped />
    {{path}}
    <fa-dialog v-model="showDialog" radius="5" type="success" :model-style="{background: '#aaaaaa99', 'backdrop-filter': 'blur(3px)'}">
      <div>
        <fa-icon :size="20" name="electron-logo" />
      </div>
    </fa-dialog>
  </div>
</template>

<style scoped lang="scss">

</style>
