// /src/store/index.js
import { reactive } from "vue";
import { defineStore } from "pinia";
import { useRouter } from "vue-router";
import { provideApolloClient, useMutation } from "@vue/apollo-composable";
import { SIGNIN } from "../graphql/mutations/signin.js";
import { SIGNUP } from "../graphql/mutations/signup.js";
import { apolloClient } from "../graphql/apollo.js";
import { authErrorMap } from "../errors/authErrorMap.js";

provideApolloClient(apolloClient);

/**
 * Normalize GraphQL or TGU errors for UI
 */
function normalizeError(err) {
  // 1️⃣ Check if it's a GraphQLError with extensions
  const gqlErr = err?.graphQLErrors?.[0];
  if (gqlErr) {
    const code = gqlErr.extensions?.code || "UNKNOWN_ERROR";
    return {
      code,
      message: authErrorMap[code] || gqlErr.message,
    };
  }

  // 2️⃣ Check if it's an object from TGU resolver
  if (err?.code || err?.message) {
    return {
      code: err.code || "UNKNOWN_ERROR",
      message: err.message || "Something went wrong",
    };
  }

  // 3️⃣ Fallback
  return {
    code: "UNKNOWN_ERROR",
    message: "Something went wrong",
  };
}

export const useStore = defineStore("store", () => {
  const router = useRouter();

  const app = reactive({
    isInitialized: false,
    isAuthenticated: !!localStorage.getItem("token"),
  });

  const user = reactive({
    token: localStorage.getItem("token"),
  });

  async function init() {
    if (app.isInitialized) return;
    app.isInitialized = true;
    console.info("🚀 App Initialized");
  }

  async function signup(payload) {
    const { mutate } = useMutation(SIGNUP);

    try {
      const res = await mutate({ input: payload });
      const auth = res.data.signup;

      if (!auth?.token) {
        // Use resolver-provided error if present
        throw (
          auth?.error || { code: "USER_EXISTS", message: "User already exists" }
        );
      }

      user.token = auth.token;
      localStorage.setItem("token", user.token);
      app.isAuthenticated = true;

      router.push("/");
      return true;
    } catch (err) {
      const normalized = normalizeError(err);
      console.error("Signup error:", normalized);
      throw normalized; // UI will show error.message
    }
  }

  async function signin(payload) {
    const { mutate } = useMutation(SIGNIN);

    try {
      const res = await mutate({ input: payload });
      const auth = res.data.signin;

      if (!auth?.token) {
        throw (
          auth?.error || {
            code: "INVALID_CREDENTIALS",
            message: "Invalid credentials",
          }
        );
      }

      user.token = auth.token;
      localStorage.setItem("token", user.token);
      app.isAuthenticated = true;

      router.push("/");
      return true;
    } catch (err) {
      const normalized = normalizeError(err);
      console.error("Signin error:", normalized);
      throw normalized;
    }
  }

  function signout() {
    localStorage.removeItem("token");
    user.token = null;
    app.isAuthenticated = false;
    router.push("/auth/signin");
  }

  return {
    init,
    app,
    user,
    signup,
    signin,
    signout,
  };
});
