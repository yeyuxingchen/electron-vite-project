import { createApp } from 'vue'
import { createPinia } from 'pinia'

import ContextMenu from '@imengyu/vue3-context-menu'

import './styles/index.scss'
import 'uno.css';
import './permission'
import App from './App.vue'
import router from './router'
import { errorHandler } from './error'
import './utils/hackIpcRenderer'
import uiProvider from './ui/provider'

// 加载 iconify 图标
import { downloadAndInstall } from '@renderer/iconify'
import icons from '@renderer/iconify/index.json'

import 'virtual:svg-icons-register'

import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'


const app = createApp(App)
const store = createPinia()
app.use(router)
app.use(store)
app.use(uiProvider)
app.use(ContextMenu)
errorHandler(app)
if (icons.isOfflineUse) {
  for (const info of icons.collections) {
    downloadAndInstall(info)
  }
}
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app')
