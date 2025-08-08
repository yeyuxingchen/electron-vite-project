import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss';

export default defineConfig({
  presets: [
    presetUno(),          // 原子化核心
    presetAttributify(),  // 支持属性形式的写法，如 <div text="red-500" />
    presetIcons(),        // 内置图标支持
  ],
});
