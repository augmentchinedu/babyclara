const routes = [
  { path: "/", component: () => import("../pages/Home.vue") },
  { path: "/auth", component: () => import("../pages/auth/SignUp.vue") },
  { path: "/auth/signin", component: () => import("../pages/auth/SignIn.vue") },
];

export default routes;
