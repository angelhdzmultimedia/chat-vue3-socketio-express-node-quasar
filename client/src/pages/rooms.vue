<script setup lang="ts">
import { router } from '../router'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const rooms = ref([])
const route = useRoute()
onMounted(async () => {
  const response = await fetch('https://localhost:5000/api/chat/rooms')
  const data = await response.json()

  rooms.value = data
})

async function joinRoom(room: string) {
  await router.push(`/room?username=${route.query.username}&room=${room}`)
}
</script>

<template>
  <main class="column">
    <span
      >Connected as:
      <span class="text-bold">{{ $route.query.username }}</span></span
    >
    <span class="text-h4">Rooms</span>
    <q-btn
      color="purple"
      @click="joinRoom(room)"
      v-for="room in rooms"
      :label="room"
    ></q-btn>
  </main>
</template>
