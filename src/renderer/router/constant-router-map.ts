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
    component: Software,
    children: [
      {
        path: '',
        name: '首页',
        component: () => import('@renderer/views/home-page/index.vue'),
      }
    ]
    // component: () => import('@renderer/views/landing-page/LandingPage.vue'),
  },
  {
    path: '/tools/nginx',
    name: 'nginx',
    component: () => import('@renderer/views/tools/nginx/index.vue'),
  }
]

export default routes
