<script setup lang="ts">
import { router } from '../router'
import { ref } from 'vue'
import { useChatStore } from '../stores/chat'

const username = ref('')
const chatStore = useChatStore()

async function connect() {
  await chatStore.connect(username.value)
  await router.push(`/rooms`)
}
</script>

<template>
  <main class="column q-pa-lg q-gutter-y-md">
    <span class="text-h4">Welcome</span>
    <q-input v-model="username" label="Username" filled></q-input>
    <q-btn @click="connect" color="primary" label="Connect"></q-btn>
  </main>
</template>
