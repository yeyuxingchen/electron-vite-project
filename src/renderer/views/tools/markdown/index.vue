<script setup lang="ts">
  import {ref} from "vue";
  import { MdEditor } from 'md-editor-v3';
  import 'md-editor-v3/lib/style.css';
  import {debounce} from "@renderer/utils/utils";
  import useStoreSystemBar from "@store/system.bar";
  const { ipcRendererChannel } = window

  const text = ref('')
  const filePath = ref('')
  const useSystemBarStore = useStoreSystemBar()
  const pathCache = localStorage.getItem('markdown.path')
  if (pathCache) {
    filePath.value = pathCache
  }

  function writeFile(path: string, val: string){
    ipcRendererChannel.writeFile.invoke({
      name: path,
      content: val
    }).then(res => {
      useSystemBarStore.setSystemBar({tips: res ? '保存成功' : '保存失败'})
      setTimeout(() => {
        useSystemBarStore.setSystemBar({tips: path.split(/[/\\]/).pop(), content: path})
      }, 500)
    })
  }

  async function onMdSave(val: any){
    useSystemBarStore.setSystemBar({tips: '正在保存'})
    if (!filePath.value) {
      const path = await ipcRendererChannel.openSaveDialog.invoke({
        title: "保存文件",
        defaultPath: "untitled.md",
        filters: [{ name: "Markdown", extensions: ["md"] }]
      })
      if (filePath) {
        filePath.value = path.filePath
      }
    }
    writeFile(filePath.value, val)
  }

  let markdownCache = localStorage.getItem('markdown.cache')
  markdownCache = markdownCache ? JSON.parse(markdownCache) : {}
  text.value = markdownCache.content || ''
  const onMdChange = debounce((content: any) => {
    markdownCache.content = content
    localStorage.setItem('markdown.cache', JSON.stringify(markdownCache))
    if (filePath.value) {
      localStorage.setItem('markdown.path', filePath.value)
      writeFile(filePath.value, content)
    }
  }, 500)

  function onUploadImg(val) {
    console.log(val)
  }
</script>

<template>
  <div h-full>
    <MdEditor v-model="text" class="!h-full" @onSave="onMdSave" @change="onMdChange" @click="onUploadImg"/>
  </div>
</template>

<style scoped lang="scss">
:deep(.md-editor-code-head) {
  z-index: 2 !important;
}
:deep(.md-editor-fullscreen) {
  margin-top: 30px;
}
</style>
