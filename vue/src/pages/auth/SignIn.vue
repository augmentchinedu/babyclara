<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>Welcome Back</h1>
      <p>The Great Unknown awaits</p>

      <form @submit.prevent="submit">
        <input
          v-model="form.identifier"
          placeholder="Username or Email"
          required
        />

        <input
          v-model="form.password"
          type="password"
          placeholder="Password"
          required
        />

        <button :disabled="loading">
          {{ loading ? "Signing in..." : "Sign In" }}
        </button>

        <!-- Display TGU error messages -->
        <p v-if="error" :class="['error', error.code]">{{ error.message }}</p>
      </form>

      <router-link to="/auth/signup">
        Don’t have a profile? Create one
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useStore } from "../../store";

const { signin } = useStore();

const form = ref({
  identifier: "",
  password: "",
});

const loading = ref(false);
const error = ref(null);

async function submit() {
  error.value = null;
  loading.value = true;

  try {
    await signin(form.value);
  } catch (err) {
    // err is normalized { code, message }
    error.value = err;
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0e0e11;
  color: #fff;
}

.auth-card {
  width: 360px;
  padding: 2rem;
  background: #16161c;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

input {
  padding: 0.7rem;
  border-radius: 6px;
  border: none;
}

button {
  padding: 0.7rem;
  background: #22c55e;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.error {
  font-size: 0.9rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  border-radius: 6px;
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
}

/* Optional styling based on error code */
.INVALID_CREDENTIALS {
  background: rgba(255, 107, 107, 0.15);
}

.UNKNOWN_ERROR {
  background: rgba(255, 179, 0, 0.15);
}
</style>
