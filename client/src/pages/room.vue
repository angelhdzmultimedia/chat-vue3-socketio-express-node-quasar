<script setup lang="ts">
import { router } from '../router'
import { ref, onMounted, nextTick, onUpdated } from 'vue'
import { useChatStore } from '../stores/chat'
import { useSoundStore } from '../stores/sound'

import { useRoute } from 'vue-router'

const soundStore = useSoundStore()
const chatStore = useChatStore()
const route = useRoute()
const message = ref('')
const room = ref(route.query.room ?? 'Lobby')
const username = ref(route.query.username ?? 'Guest')
const messages = ref([])
const messagesList = ref(null)

function updateMessagesList() {
  const element = messagesList.value?.$el.lastElementChild?.scrollIntoView({
    behavior: 'smooth',
  })
}

onMounted(async () => {
  chatStore.emit('joinRoom', { room: room.value, username: username.value })
  chatStore.subscribe('broadcast', (message) => {
    messages.value.push({
      type: 'message',
      ...message,
    })
    setTimeout(updateMessagesList, 150)
    if (message.username !== username.value) {
      soundStore.play('broadcast')
    }
  })

  chatStore.subscribe('userJoined', (message) => {
    messages.value.push({
      type: 'notify',
      ...message,
      text: `${message.username} joined the room.`,
    })
    setTimeout(updateMessagesList, 150)
    if (message.username !== username.value) {
      soundStore.play('userJoined')
    }
  })

  chatStore.subscribe('userLeft', (message) => {
    messages.value.push({
      type: 'notify',
      ...message,
      text: `${message.username} left the room.`,
    })
    if (message.username !== username.value) {
      soundStore.play('userLeft')
    }
  })
})

function send() {
  chatStore.emit('newMessage', {
    username: username.value,
    text: message.value,
    room: room.value,
  })
  message.value = ''
}
</script>

<template>
  <main class="column full-width full-height justify-between q-pa-lg">
    <div class="column q-gutter-y-sm">
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
            {{ message.text }}
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
    <div class="column q-pb-md">
      <q-input v-model="message" label="Message"></q-input>
      <q-btn color="primary" @click="send" label="Send"></q-btn>
    </div>
  </main>
</template>
