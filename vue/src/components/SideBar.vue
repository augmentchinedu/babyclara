<template>
  <aside class="flex flex-col w-64 h-screen bg-gray-800 text-white">
    <!-- Header -->
    <div class="flex items-center justify-center h-20 border-b border-gray-700">
      <h1 class="text-xl font-bold">My App</h1>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto p-4">
      <ul class="space-y-2">
        <li>
          <a href="#dashboard" class="block px-4 py-2 rounded hover:bg-gray-700"
            >Dashboard</a
          >
        </li>
        <li>
          <a href="#projects" class="block px-4 py-2 rounded hover:bg-gray-700"
            >Projects</a
          >
        </li>
        <li>
          <a href="#settings" class="block px-4 py-2 rounded hover:bg-gray-700"
            >Settings</a
          >
        </li>
        <li>
          <a href="#profile" class="block px-4 py-2 rounded hover:bg-gray-700"
            >Profile</a
          >
        </li>
      </ul>
    </nav>

    <!-- Footer -->
    <div class="p-4 border-t border-gray-700">
      <button
        class="w-full px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
        @click="signout"
      >
        Sign Out
      </button>
    </div>
  </aside>
</template>

<script setup>
import { useStore } from "../store/index.js";

const { signout } = useStore();
</script>
