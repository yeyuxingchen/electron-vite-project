import {computed, onMounted, ref, watch} from "vue";


export const usePreventClose = () => {
  const dialogId = ref(`dialog-${Math.random().toString(36).slice(2)}`)

  function dialogBeforeClose() {
    const execute = {
      times: 1,
      func: () => {
        const dialog = document.querySelector(`#${dialogId.value}`) as HTMLElement
        let transform = 'scale(1.03)'
        if (dialog.style.transform.includes('translate')) {
          transform += ` ${dialog.style.transform}`
        }
        dialog.animate([
          {transformOrigin: 'center'},
          {transform},
          {transformOrigin: 'center'},
        ], {
          duration: 150,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        })
      },
    }

    execute.func()
    for (let i = execute.times; i >= 0; i--) {
      setTimeout(() => {
        execute.func()
      }, i * 170)
    }
  }

  return {
    dialogId,
    dialogBeforeClose,
  }
}

export const useHeaderType = (props: any, emit: any) => {
  const show = ref(false)
  watch(() => props.modelValue, (val) => {
    show.value = val
  })
  watch(show, (val) => {
    emit('update:modelValue', val)
  })
  function close() {
    emit('update:modelValue', false)
  }
  function clickClose() {
    emit('update:modelValue', false)
  }
  const dialogHeaderType = computed(() => {
    if (['success', 'primary', 'info', 'warning', 'danger'].filter(i => props.type.includes(i)).length) {
      return `var(--el-color-${props.type})`
    }
    const custom = {
      'black': '#2B2D30',
      'black-transparent': '#2B2D30aa',
      'dark': '#000000',
      'dark-transparent': '#000000aa'
    }
    return custom[props.type]
  })

  onMounted(() => {
    show.value = props.modelValue
  })

  return {
    dialogHeaderType,
    clickClose,
    close,
    show
  }
}
