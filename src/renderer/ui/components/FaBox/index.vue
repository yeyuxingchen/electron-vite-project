<script setup lang="ts">

import {useHeaderType} from "@renderer/ui/components/hooks/useDialog";
import {computed} from "vue";

defineOptions({
  name: 'FaBox',
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
  icon: {
    type: String,
    default: 'material-symbols-light:dialogs-outline-rounded',
  },
  width: {
    type: String,
    default: '300px',
  },
  height: {
    type: String,
    default: '400px',
  },
  background: {
    type: String,
    default: 'white',
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
  position: {
    type: [String, Object],
    default: 'bottom-right'
  },
  positionOffset: {
    type: String,
    default: '20px'
  }
})
const emit = defineEmits(['update:modelValue'])
const {dialogHeaderType, clickClose, close, show} = useHeaderType(props, emit)
const positionStyle = computed(() => {
  if (typeof props.position === 'object') {
    return props.position
  }
  if (props.position === 'top-left') {
    return {
      top: props.positionOffset,
      left: props.positionOffset,
    }
  }
  if (props.position === 'top-right') {
    return {
      top: props.positionOffset,
      right: props.positionOffset,
    }
  }
  if (props.position === 'bottom-left') {
    return {
      bottom: props.positionOffset,
      left: props.positionOffset,
    }
  }
  if (props.position === 'bottom-right') {
    return {
      bottom: props.positionOffset,
      right: props.positionOffset,
    }
  }
})
</script>

<template>
  <el-dialog
    v-model="show" :draggable="draggable" class="my-dialog" modal-class="box-modal" :show-close="false"
    :width="width" @close="close" append-to-body :modal="false"
    :style="{'--radius': Number(radius) ? (radius + 'px') : radius, '--type': dialogHeaderType, position: 'absolute', ...positionStyle}"
  >
    <template #header>
      <div class="main-title">
        <div flex items-center pl-10px>
          <fa-icon :name="icon"/>
          <span pl-3px>{{ title }}</span>
        </div>
        <div class="header-center">
          <slot name="header-center"/>
        </div>
        <div pr-10px pt-3px>
          <fa-icon name="ic:baseline-close" pl-10px color="white" :size="5" @click="clickClose"/>
        </div>
      </div>
    </template>
    <div class="main" :style="{ height, background, width: '100%' }">
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
  width: calc(100% - 150px);
  height: 30px;
}

:global(.box-modal) {
  pointer-events: none;
}

:global(.box-modal > .el-overlay-dialog) {
  overflow: hidden !important;
  pointer-events: none;
}

:global(.box-modal > .el-overlay-dialog > .my-dialog) {
  pointer-events: all;
  margin: 0;
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
}
</style>

