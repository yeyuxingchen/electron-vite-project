<script setup lang="ts">
import {ref} from "vue";

const asideClose = ref(false)
const delayShow = ref(false)

function handleAsideClose() {
  asideClose.value = true
  delayShow.value = false
  setTimeout(_ => delayShow.value = true, 300)
}

function handleAsideOpen() {
  asideClose.value = false
}

</script>

<template>
  <div>
    <div class="aside" flex items-center :style="{width: (asideClose ? 0 : 50) + 'px'}">
      <fa-icon class="aside-close" name="bian-mu" :size="5" @click="handleAsideClose"/>
    </div>
    <fa-icon v-if="asideClose && delayShow" @click="handleAsideOpen" class="open-aside" name="ha-shi-qi" :size="5"/>
  </div>
</template>

<style scoped lang="scss">

@mixin icon {
  cursor: pointer;
  transition: 0.15s ease-in-out;
  bottom: 15px;

  &:hover {
    transform: scale(1.1);
  }
  &:active {
    transform: scale(0.9);
  }
}

.aside {
  height: 100%;
  overflow: hidden;
  position: relative;
  border-right: 2px solid rgb(var(--sys-bar-border));
  transition: width .3s cubic-bezier(0.68, -0.55, 0.27, 1.55);

  &-close {
    @include icon;
    position: absolute;
    right: calc(50% - 10px);
  }
}

.open-aside {
  @include icon;
  position: absolute;
  left: 10px;
}
</style>
