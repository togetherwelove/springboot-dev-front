import { createRouter, createWebHistory, Router } from "vue-router";
import Default from "../layouts/Default.vue";
import Auth from "../layouts/Auth.vue";
import { useAuthStore } from "@/stores/AuthService";

const routes = [
  { path: "", redirect: "/home" },
  {
    name: "default",
    path: "/",
    component: Default,
    children: [
      {
        name: "home",
        path: "/home",
        component: () => import("@/views/Home.vue"),
        meta: { authRequired: true },
      },
      {
        name: "about",
        path: "/about",
        component: () => import("@/views/About.vue"),
        meta: { authRequired: true },
      },
      {
        name: "post",
        path: "/post",
        component: () => import("@/views/post/Post.vue"),
        meta: { authRequired: true },
      },
    ],
    meta: { authRequired: true },
  },
  {
    name: "auth",
    path: "/auth",
    component: Auth,
    children: [
      {
        name: "login",
        path: "/auth/login",
        component: () => import("@/views/auth/Login.vue"),
        meta: { authRequired: false },
      },
      {
        name: "signup",
        path: "/auth/signup",
        component: () => import("@/views/auth/Signup.vue"),
        meta: { authRequired: false },
      },
    ],
  },
];

const router: Router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();
  if (auth.getToken === "") {
    await auth.refresh();
  }
  if (to.meta.authRequired && auth.getToken === "") {
    next({ name: "login" });
    return;
  }
  next();
});

export default router;
