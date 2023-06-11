import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../pages/index.vue'
import { useChatStore } from '../stores/chat'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'index',
      component: HomeView,
    },
    {
      path: '/rooms',
      name: 'rooms',
      component: () => import('../pages/rooms.vue'),
    },
    {
      path: '/room/:room',
      name: 'room',
      component: () => import('../pages/room.vue'),
      props: true,
    },
  ],
})

router.beforeResolve((to) => {
  const chatStore = useChatStore()

  if (to.path.startsWith('/room') && !chatStore.isConnected) {
    return '/'
  }
})

export default router
