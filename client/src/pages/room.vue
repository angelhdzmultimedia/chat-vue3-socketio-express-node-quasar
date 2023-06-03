<script setup lang="ts">
import { router } from '../router'
import { ref, onMounted } from 'vue'
import { io } from 'socket.io-client'
import { useRoute } from 'vue-router'

const clientSocket = io('ws://localhost:5000')
const route = useRoute()
const message = ref('')
const room = ref(route.query.room ?? 'Lobby')
const username = ref(route.query.username ?? 'Guest')
const messages = ref([])
const messageTypes = ['newMessage', 'joinRoom', 'userJoined', 'broadcast']

onMounted(async () => {
  clientSocket.emit('joinRoom', { room: room.value, username: username.value })
  clientSocket.on('broadcast', (message) => {
    messages.value.push({
      type: 'message',
      ...message,
    })
  })

  clientSocket.on('userJoined', (message) => {
    messages.value.push({
      type: 'notify',
      ...message,
    })
  })
})

function send() {
  clientSocket.emit('newMessage', {
    username: username.value,
    text: message.value,
    room: room.value,
  })
  message.value = ''
}
</script>

<template>
  <main class="column full-width full-height justify-between q-pa-md">
    <div class="column">
      <span
        >Connected as:
        <span class="text-bold text-primary">{{ username }}</span></span
      >

      <span class="text-h4 text-primary">{{ room }}</span>
    </div>
    <q-list dense style="max-height: 350px" class="overflow-scroll bg-grey-4">
      <q-item v-for="message in messages">
        <div v-if="message.type === 'notify'">
          <span class="text-bold text-grey">
            <q-icon name="volume_up"></q-icon>
            {{ message.username }} joined the room.
          </span>
        </div>
        <div v-if="message.type === 'message'">
          <span class="text-bold">{{ message.username }}:&nbsp;</span>
          <span>{{ message.text }}</span>
        </div>
      </q-item>
    </q-list>
    <div class="column">
      <q-input v-model="message" placeholder="Message"></q-input>
      <q-btn color="primary" @click="send" label="Send"></q-btn>
    </div>
  </main>
</template>
