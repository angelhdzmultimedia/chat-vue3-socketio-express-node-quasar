<script setup lang="ts">
import { router } from '../router'
import { ref, onMounted, nextTick, onUpdated } from 'vue'
import { io } from 'socket.io-client'
import { useRoute } from 'vue-router'

const clientSocket = io('ws://localhost:5000')
const route = useRoute()
const message = ref('')
const room = ref(route.query.room ?? 'Lobby')
const username = ref(route.query.username ?? 'Guest')
const messages = ref([])
const messagesList = ref(null)
const messageTypes = [
  'newMessage',
  'joinRoom',
  'userJoined',
  'broadcast',
] as const
type MessageType = typeof messageTypes[number]

function subscribe(messageType: MessageType, callback) {
  clientSocket.on(messageType, callback)
}

function emit<T>(messageType: MessageType, ...args: T[]) {
  clientSocket.emit(messageType, ...args)
}

function updateMessagesList() {
  const element = messagesList.value?.$el.lastElementChild?.scrollIntoView({
    behavior: 'smooth',
  })
}

onMounted(async () => {
  emit('joinRoom', { room: room.value, username: username.value })
  subscribe('broadcast', (message) => {
    messages.value.push({
      type: 'message',
      ...message,
    })
    setTimeout(updateMessagesList, 150)
  })

  subscribe('userJoined', (message) => {
    messages.value.push({
      type: 'notify',
      ...message,
    })
    setTimeout(updateMessagesList, 150)
  })
})

function send() {
  emit('newMessage', {
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
    <q-list
      ref="messagesList"
      dense
      style="max-height: 350px; height:  350px; full-width"
      class="overflow-auto bg-grey-4"
    >
      <q-item v-for="(message, index) in messages" :key="index">
        <div v-if="message.type === 'notify'">
          <span class="text-bold text-grey">
            <q-icon name="volume_up"></q-icon>
            {{ message.username }} joined the room.
          </span>
        </div>
        <div v-if="message.type === 'message'">
          <span class="text-bold text-primary"
            >{{ message.username }}:&nbsp;</span
          >
          <span class="text-black">{{ message.text }}</span>
        </div>
      </q-item>
    </q-list>
    <div class="column">
      <q-input v-model="message" placeholder="Message"></q-input>
      <q-btn color="primary" @click="send" label="Send"></q-btn>
    </div>
  </main>
</template>
