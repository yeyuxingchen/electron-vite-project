import { defineStore } from 'pinia'
import {reactive, ref} from "vue";

interface BarInfo {
  tips?: string
  content?: string
  effect?: string
  icon?: string
  iconSize?: number
}

const useStoreSystemBar = defineStore('systemBar', () => {
  const systemBar = reactive<BarInfo>({
    tips: '',
    content: '',
    effect: 'light',
    icon: '',
    iconSize: 12,
  })
  const recentFiles = ref(JSON.parse(localStorage.getItem('recent.files') || '[]'))


  function setSystemBar(barInfo: BarInfo) {
    for (const key in barInfo) {
      systemBar[key] = barInfo[key]
    }
  }

  function setRecentFile({label, path, time}){
    const isExist = recentFiles.value.some(i => i.path === path)
    if (isExist) {
      recentFiles.value.filter(i => i.path === path).forEach(i => (i.time = new Date().getTime()))
    } else {
      recentFiles.value.push({ label, path, time })
    }
    recentFiles.value.sort((a, b) => b.time - a.time)
    localStorage.setItem('recent.files', JSON.stringify(recentFiles.value))
  }

  return {
    systemBar,
    setSystemBar,
    recentFiles,
    setRecentFile
  }
})

export default useStoreSystemBar
