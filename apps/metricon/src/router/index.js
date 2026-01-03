import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/top',
    name: 'top',
    component: () => import('@/pages/Top.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
