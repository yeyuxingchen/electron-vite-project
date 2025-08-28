import { defineStore } from 'pinia'
import {reactive} from "vue";

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
  function setSystemBar(barInfo: BarInfo) {
    for (const key in barInfo) {
      systemBar[key] = barInfo[key]
    }
  }

  return {
    systemBar,
    setSystemBar
  }
})

export default useStoreSystemBar
