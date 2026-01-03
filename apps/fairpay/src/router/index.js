import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/top',
    name: 'top',
    component: () => import('@/pages/Top.vue')
  },
  {
    path: '/auth/login',
    name: 'login',
    component: () => import('@/pages/auth/Login.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
