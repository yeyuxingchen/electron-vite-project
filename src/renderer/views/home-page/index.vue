<script setup lang="ts">


const { ipcRendererChannel } = window
import {computed, onMounted, ref} from "vue";
import ExcelJS from 'exceljs'

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

const lists = ref([])
function handelSelectFile(){
  ipcRendererChannel.openDialog.invoke({
    filters: [{name: '全部文件', extensions: ['xlsx']}],
    properties: ['openFile']
  }).then(async res => {
    console.log(res)
    if (res.canceled) {
      return
    }
    ipcRendererChannel.operateExcel.invoke(res.filePaths[0]).then(res => {
      lists.value = res
    })
  })
}

const percentage = ref(0)
onMounted(() => {
  ipcRendererChannel.DownloadProgress.on((_, arg) => {
    percentage.value = Number(arg)
  })
})

const tableHeaders = computed(() => {
  return lists.value.length > 0 ? lists.value[0] : []
})

const tableValues = computed(() => {
  const result = []
  for (const val of lists.value) {
    result.push(tableHeaders.value.reduce((r, i, index) => {
      r[i] = val[index]
      return r
    }, {}))
  }
  return result
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
    <el-button type="primary" plain @click="handelSelectFile">
      打开
    </el-button>
    <el-progress my-30px :status="percentage === 100 ? 'success' : ''" :percentage="percentage" :stroke-width="15" striped />
    {{path}}
    <fa-dialog v-model="showDialog" radius="5" type="success" :model-style="{background: '#aaaaaa99', 'backdrop-filter': 'blur(3px)'}">
      <div>
        <fa-icon :size="20" name="electron-logo" />
      </div>
    </fa-dialog>

<!--    {{tableHeaders}}-->
<!--    {{tableValues}}-->
    <el-table :data="tableValues" style="width: calc(100vw - 130px)" height="calc(100vh - 330px)">
      <el-table-column v-for="prop in tableHeaders" :prop="prop" :label="prop" />
    </el-table>
  </div>
</template>

<style scoped lang="scss">

</style>
