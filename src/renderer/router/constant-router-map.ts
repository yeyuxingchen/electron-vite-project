import { RouteRecordRaw } from 'vue-router'
import Software from "@renderer/layouts/software.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@renderer/views/404.vue'),
  },
  {
    path: '/',
    name: '总览',
    redirect: '/tools/markdown/editor'
  },
  {
    path: '/tools/nginx',
    name: 'nginx',
    component: () => import('@renderer/views/tools/nginx/index.vue'),
  },
  {
    path: '/tools/markdown/editor',
    name: 'markdown-editor',
    component: () => import('@renderer/views/tools/markdown/index.vue'),
  }
]

export default routes
