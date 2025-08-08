import { join } from 'path'
import { defineConfig } from 'vite'
import vuePlugin from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import viteIkarosTools from './plugin/vite-ikaros-tools'
import { getConfig } from './utils'
import components from 'unplugin-vue-components/vite'
import UnoCSS from 'unocss/vite';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from "node:path";
import process from "node:process";


function resolve(dir: string) {
  return join(__dirname, '..', dir)
}
const config = getConfig()

const root = resolve('src/renderer')

export default defineConfig((mode: string, isBuild = false) => ({
  mode: config && config.NODE_ENV,
  root,
  define: {
    __CONFIG__: config,
    __ISWEB__: Number(config && config.target),
  },
  resolve: {
    alias: {
      '@renderer': root,
      '@store': join(root, '/store/modules'),
    },
  },

  base: './',
  build: {
    outDir:
      config && config.target
        ? resolve('dist/web')
        : resolve('dist/electron/renderer'),
    emptyOutDir: true,
    target: 'esnext',
    cssCodeSplit: false
  },
  server: {},
  plugins: [
    vueJsx(), vuePlugin(), viteIkarosTools(), UnoCSS(),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/renderer/assets/icons/svg/')],
      symbolId: 'icon-[dir]-[name]',
      svgoOptions: isBuild,
    }),
    // https://github.com/unplugin/unplugin-vue-components
    components({
      globs: [
        '../renderer/ui/components/*/index.vue',
        '../renderer/components/*/index.vue',
      ],
      dts: '../renderer/types/components.d.ts',
    }),
  ],
  optimizeDeps: {},
}))
