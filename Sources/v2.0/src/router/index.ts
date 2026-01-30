import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/tab1'
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: '',
        redirect: '/tabs/tab1'
      },
      {
        path: 'tab1',
        component: () => import('@/views/Tab1Page.vue')
      },
      {
        path: 'tab2',
        component: () => import('@/views/Tab2Page.vue')
      },
      {
        path: 'settings',
        component: () => import('@/views/SettingsPage_fixed.vue')
      },
      {
        path: 'ocr',
        component: () => import('@/views/OCRPage.vue')
      }
    ]
  }
]

// Fix base URL for development - use '/' instead of './' to avoid routing issues
const baseUrl = import.meta.env.BASE_URL === './' ? '/' : import.meta.env.BASE_URL;

const router = createRouter({
  history: createWebHistory(baseUrl),
  routes
})

export default router
