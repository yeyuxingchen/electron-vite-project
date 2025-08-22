import {defineStore} from "pinia";
import {reactive} from "vue";

const useSettingsStore = defineStore(
  // 唯一ID
  'settings',
  () => {
    const systemBarStore = localStorage.getItem('system.bar') ? JSON.parse(localStorage.getItem('system.bar')) : {}
    const systemBar = reactive({
      color: systemBarStore.color || '51 51 51',
      background: systemBarStore.background || '255 255 255',
      border: systemBarStore.border || '217 217 217',
      panel: systemBarStore.panel || '255 255 255',
      "background-hover": systemBarStore['background-hover'] || '241 241 241'
    })

    function updateSystemBar() {
      const systemBarRgb = {}
      for (const key in systemBar) {
        systemBarRgb[key] = `rgb(${systemBar[key].split(' ').join(',')})`
        document.documentElement.style.setProperty(`--sys-bar-${key}`, systemBar[key]);
      }
      const { ipcRendererChannel } = window
      console.log(ipcRendererChannel)
      ipcRendererChannel.changeSystemBar.invoke({...systemBarRgb})
    }

    function setSystemBar(config: any) {
      for (const key in config) {
        systemBar[key] = config[key]
      }
      updateSystemBar()
      localStorage.setItem('system.bar', JSON.stringify(systemBar))
    }
    return {
      setSystemBar,
      updateSystemBar
    }
  },
)

export default useSettingsStore
