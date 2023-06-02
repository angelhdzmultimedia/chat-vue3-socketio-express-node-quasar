<script setup lang="ts">
import { router } from '../router'
import { ref } from 'vue'

const username = ref('')

async function join() {
  await router.push(`/rooms?username=${username.value}`)
}
</script>

<template>
  <main>
    <span class="text-h4">Welcome</span>
    <q-input v-model="username" placeholder="Username" filled></q-input>
    <q-btn @click="join" color="primary" label="Join"></q-btn>
  </main>
</template>
