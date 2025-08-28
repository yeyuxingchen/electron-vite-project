<script setup lang="ts">
import {ref} from "vue";
import {MdEditor, ToolbarNames} from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import {debounce} from "@renderer/utils/utils";
import useStoreSystemBar from "@store/system.bar";

const {ipcRendererChannel} = window

const text = ref('')
const filePath = ref('')
const useSystemBarStore = useStoreSystemBar()
const pathCache = localStorage.getItem('markdown.path')
const toolbars = [
  'bold',
  'underline',
  'italic',
  'strikeThrough',
  '-',
  'title',
  'sub',
  'sup',
  'quote',
  'unorderedList',
  'orderedList',
  'task',
  '-',
  'codeRow',
  'code',
  'link',
  'image',
  'table',
  'mermaid',
  'katex',
  '-',
  'revoke',
  'next',
  'save',
  0,
  '=',
  'pageFullscreen',
  'fullscreen',
  'preview',
  'previewOnly',
  'htmlPreview',
  'catalog',
  'github',
];
if (pathCache) {
  filePath.value = pathCache
}

function writeFile(path: string, val: string) {
  ipcRendererChannel.writeFile.invoke({
    name: path,
    content: val
  }).then(res => {
    useSystemBarStore.setSystemBar({tips: res ? '保存成功' : '保存失败'})
    setTimeout(() => {
      useSystemBarStore.setSystemBar({tips: path.split(/[/\\]/).pop(), content: path})
    }, 200)
  })
}

async function onMdSave(val: any) {
  useSystemBarStore.setSystemBar({tips: '正在保存'})
  if (!filePath.value) {
    const path = await ipcRendererChannel.openSaveDialog.invoke({
      title: "保存文件",
      defaultPath: "untitled.md",
      filters: [{name: "Markdown", extensions: ["md"]}]
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

const handleUploadImg = async (files, callback) => {
  const urls = await Promise.all(
    files.map(file => {
      return new Promise(resolve => {
        const reader = new FileReader()
        reader.onload = e => resolve(e.target.result)
        reader.readAsDataURL(file)
      })
    })
  )
  callback(urls)
}

function clickInsert() {

}
</script>

<template>
  <div h-full>
    <MdEditor
      v-model="text" :toolbars="toolbars"
      class="!h-full" @onSave="onMdSave"
      @change="onMdChange"
      @onUploadImg="handleUploadImg"
    >
   <template #defToolbars>
      <div flex items-center justify-center>
        <div @click="clickInsert" flex items-center justify-center class="my-toolbar">
          <el-popover
            placement="bottom"
            title="Title"
            :width="200"
            trigger="hover"
            content="this is content, this is content, this is content"
          >
            <template #reference>
              <fa-icon name="insert-line" font-bold :size="4"/>
            </template>
          </el-popover>
        </div>
      </div>
    </template>
    </MdEditor>
  </div>
</template>

<style scoped lang="scss">
:deep(.md-editor-code-head) {
  z-index: 2 !important;
}

:deep(.md-editor-fullscreen) {
  margin-top: 30px;
}

.my-toolbar{
  padding: 4px 6px;
  margin: 0 2px;
  transition: .15s;
  border-radius: 2px;
  cursor: pointer;
  &:hover {
    background: var(--md-bk-color-outstand);
  }
  &:active{
    transform: scale(0.95);
  }
}
</style>
