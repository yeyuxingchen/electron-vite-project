<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import {useHeaderType, usePreventClose} from "@renderer/ui/components/hooks/useDialog";

const modalTheme = {
  default: {
    background: '#aaaaaa99',
    'backdrop-filter': 'blur(3px)'
  }
}
defineOptions({
  name: 'FaDialog',
})
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: true,
  },
  type: {
    type: String,
    default: 'primary',
  },
  width: {
    type: String,
    default: '800px',
  },
  height: {
    type: String,
    default: 'calc(100vh - 300px)',
  },
  background: {
    type: String,
    default: 'white',
  },
  top: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '弹窗标题',
  },
  draggable: {
    type: Boolean,
    default: true,
  },
  radius: {
    type: String,
    default: '0',
  },
  modelStyle: {
    type: Object,
    default: () => ({})
  },
  destroyOnClose: {
    type: Boolean,
    default: false,
  }
})
const emit = defineEmits(['update:modelValue', 'fullChange'])
const fullscreen = ref(false)
const {dialogId, dialogBeforeClose} = usePreventClose()
const {dialogHeaderType, clickClose, close, show} = useHeaderType(props, emit)

function updateModalStyle(val: any) {
  const modal = document.querySelector(`.modal-${dialogId.value}`) as HTMLElement
  for (const [key, value] of Object.entries({...modalTheme.default, ...val})) {
    modal?.style.setProperty(key, value as string)
  }
}

watch(() => props.modelStyle, updateModalStyle)

function changeFullscreen(is_full: boolean) {
  fullscreen.value = is_full
  emit('fullChange', is_full)
}

onMounted(() => {
  updateModalStyle(props.modelStyle)
})
</script>

<template>
  <el-dialog
    :id="dialogId" v-model="show" :draggable="draggable"
    :fullscreen="fullscreen" class="my-dialog" :show-close="false"
    :top="top" :before-close="dialogBeforeClose"
    :width="width" @close="close" append-to-body
    :style="{'--radius': Number(radius) ? (radius + 'px') : radius, '--type': dialogHeaderType}"
    :modal-class="`modal-${dialogId}`" :destroy-on-close="destroyOnClose"
  >
    <template #header>
      <div class="main-title">
        <div flex items-center pl-10px>
          <fa-icon name="material-symbols-light:dialogs-outline-rounded"/>
          <span pl-3px>{{ title }}</span>
        </div>
        <div class="header-center">
          <slot name="header-center"/>
        </div>
        <div pr-10px pt-3px>
          <fa-icon v-if="fullscreen" name="majesticons:minimize" :size="5" style="transform: scale(0.8)"
                   @click="changeFullscreen(false)"/>
          <fa-icon v-else name="majesticons:maximize" :size="5" style="transform: scale(0.8)"
                   @click="changeFullscreen(true)"/>
          <fa-icon name="ic:baseline-close" pl-10px color="white" :size="5" @click="clickClose"/>
        </div>
      </div>
    </template>
    <div class="main" :style="{ height: fullscreen ? 'calc(100vh - 31px)' : height, background, width: '100%' }">
      <slot name="default"/>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
.main {
  &-title {
    background: var(--type);
    color: white;
    font-family: local-font, serif;
    font-size: 14px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    position: relative;
    z-index: 999999;

    i {
      cursor: pointer;
      transition: .15s;

      &:hover {
        transform: scale(1.1);
      }

      &:active {
        transform: scale(.9);
      }
    }

    height: calc(100% - 31px);
  }
}

.header-center {
  //background: white;
  width: calc(100% - 150px);
  height: 30px;
}

:global(.my-dialog) {
  padding: 30px 0 0 0 !important;
  background: transparent !important;
  box-shadow: none !important;

  .el-dialog__body {
    border-radius: 0 0 var(--radius) var(--radius);
    overflow: hidden;
  }
}

:global(.my-dialog > .el-dialog__header) {
  padding-bottom: 0 !important;
  border-radius: var(--radius) var(--radius) 0 0;
  overflow: hidden;
}

:global(.el-dialog.is-fullscreen) {
  overflow: hidden !important;
}

:global(.el-dialog.is-fullscreen > .el-dialog__header) {
  border-radius: 0;
}
</style>
