<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1>The Great Unknown</h1>
      <p>Create your profile via BabyClara</p>

      <form @submit.prevent="submit">
        <input
          v-model="form.username"
          type="text"
          placeholder="Username"
          required
        />

        <input v-model="form.email" type="email" placeholder="Email" required />

        <input
          v-model="form.password"
          type="password"
          placeholder="Password"
          required
        />

        <button :disabled="loading">
          {{ loading ? "Creating..." : "Create Profile" }}
        </button>

        <!-- Display TGU error messages -->
        <p v-if="error" :class="['error', error.code]">{{ error.message }}</p>
      </form>

      <router-link to="/auth/signin">
        Already have a profile? Sign in
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useStore } from "../../store";

const { signup } = useStore();

const form = ref({
  username: "",
  email: "",
  password: "",
});

const loading = ref(false);
const error = ref(null);

async function submit() {
  error.value = null;
  loading.value = true;

  try {
    await signup(form.value);
  } catch (err) {
    // err is already normalized { code, message } from store
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

h1 {
  text-align: center;
}

input {
  padding: 0.7rem;
  border-radius: 6px;
  border: none;
}

button {
  padding: 0.7rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
}

/* TGU error display */
.error {
  font-size: 0.9rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  border-radius: 6px;
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
}

/* Optional: style by error code */
.USER_ALREADY_EXISTS {
  background: rgba(255, 107, 107, 0.15);
}

.UNKNOWN_ERROR {
  background: rgba(255, 179, 0, 0.15);
}
</style>
