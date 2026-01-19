import { createWebHistory, createRouter } from "vue-router";
import { useStore } from "../store";
import routes from "./routes";

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const store = useStore();

  // ✅ Only run guard for non-auth routes
  const isAuthRoute = to.path.startsWith("/auth");

  // 1️⃣ Initialize workstation once
  if (!store.app.isInitialized) {
    try {
      console.log("Initializing...");
      await store.init();
    } catch (err) {
      console.error("Initialization failed:", err);
      return next(false);
    }
  }

  // 2️⃣ Redirect unauthenticated users only for protected routes
  if (!isAuthRoute && !store.isAuthenticated) {
    return next("/auth/signin"); // Redirect to signin
  }

  // 3️⃣ Proceed
  next();
});

export default router;
