<script setup lang="ts">
import { router } from '../router'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useChatStore } from '../stores/chat'

const chatStore = useChatStore()
const rooms = ref([])
const route = useRoute()

onMounted(async () => {
  //const response = await fetch('https://localhost:5000/api/chat/rooms')
  //const data = await response.json()
  // rooms.value = data

  chatStore.emit('roomsList', {}, (message) => {
    rooms.value = message.rooms
  })
})

async function joinRoom(room: string) {
  await router.push(`/room?username=${route.query.username}&room=${room}`)
}
</script>

<template>
  <main class="column q-pa-lg">
    <span
      >Connected as:
      <span class="text-bold text-primary">{{
        $route.query.username
      }}</span></span
    >
    <span class="text-h4">Rooms</span>
    <q-list dense class="q-gutter-y-xs">
      <q-item class="column" v-for="(room, index) in rooms" :key="index">
        <q-item-section>
          <q-btn
            style="height: 60px"
            color="purple"
            @click="joinRoom(room)"
            :label="room"
            :icon="room === 'Staff' ? 'lock' : null"
          ></q-btn>
        </q-item-section>
      </q-item>
    </q-list>
  </main>
</template>
