// stores/user.js
import { reactive } from "vue";
import { defineStore } from "pinia";
import {
  provideApolloClient,
  useMutation,
  useQuery,
} from "@vue/apollo-composable";
import { SIGNIN } from "../graphql/mutations/signin.js";
import { SIGNUP } from "../graphql/mutations/signup.js";
import { apolloClient } from "../graphql/apollo.js";

// 🔥 THIS IS REQUIRED FOR STORES
provideApolloClient(apolloClient);

export const useStore = defineStore("store", () => {
  // state
  const app = reactive({
    name: null,
    isInitialized: false,
    isAuthenticated: !!localStorage.getItem("token"),
  });

  const user = reactive({
    token: localStorage.getItem("token"),
  });

  const workstation = reactive({});

  // actions
  async function init() {
    if (app.isInitialized) return; // ✅ Prevent double initialization

    try {
      app.isInitialized = true; // ✅ Mark as initialized
      console.info("Workstation Initialized");
    } catch (err) {
      console.error("Workstation init failed:", err);
      app.isInitialized = false; // ✅ Ensure we don't falsely mark initialized
      throw err; // important for router guard
    }
  }

  async function signin(payload) {
    const { mutate, onError } = useMutation(SIGNIN);

    onError((err) => {
      console.error("Signin mutation error:", err);
    });

    console.log("Signin payload:", payload);

    const res = await mutate({
      input: payload,
    });

    console.log("SignIn result:", res);

    // ✅ update reactive state directly
    user.token = res.data.signin.token;
    app.isAuthenticated = true;

    localStorage.setItem("token", user.token);
  }

  async function signup(payload) {
    const { mutate, onError } = useMutation(SIGNUP);

    onError((err) => {
      console.error("Signup mutation error:", err);
    });

    console.log("SignUp payload:", payload);

    const res = await mutate({
      input: payload,
    });

    console.log("Signup result:", res);

    user.token = res.data.signup.token;
    app.isAuthenticated = true;

    localStorage.setItem("token", user.token);
  }

  function signout() {
    localStorage.removeItem("token");
  }

  return {
    app,
    user,
    workstation,
    init,
    signin,
    signup,
    signout,
  };
});
