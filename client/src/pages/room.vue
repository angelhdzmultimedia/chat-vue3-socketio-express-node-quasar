<script setup lang="ts">
import { router } from '../router'
import { ref, onMounted, nextTick, onUpdated } from 'vue'
import { useChatStore } from '../stores/chat'

import { useRoute } from 'vue-router'

const chatStore = useChatStore()
const route = useRoute()
const message = ref('')
const room = ref(route.query.room ?? 'Lobby')
const username = ref(route.query.username ?? 'Guest')
const messages = ref([])
const messagesList = ref(null)

const _sounds = {}

function addSounds(sounds) {
  for (const key in sounds) {
    const audio = new Audio(sounds[key])
    audio.autoPlay = false
    _sounds[key] = {
      url: sounds[key],
      audio,
      name: key,
    }
  }
}

function playSound(name: string) {
  _sounds[name].audio.play()
}

function updateMessagesList() {
  const element = messagesList.value?.$el.lastElementChild?.scrollIntoView({
    behavior: 'smooth',
  })
}

addSounds({
  broadcast:
    'https://cdn.freesound.org/sounds/592/592772-d7edabc2-8571-411b-805b-672e6d859041?filename=592772__sunart1__message-sound.wav',
  userJoined: 'http://sfxcontent.s3.amazonaws.com/soundfx/DoorBell.mp3',
  userLeft:
    'https://cdn.freesound.org/sounds/257/257046-d8fee741-cddc-493d-8591-1ce8668a4ef4?filename=257046__jagadamba__running.wav',
})

onMounted(async () => {
  chatStore.emit('joinRoom', { room: room.value, username: username.value })
  chatStore.subscribe('broadcast', (message) => {
    messages.value.push({
      type: 'message',
      ...message,
    })
    setTimeout(updateMessagesList, 150)
    if (message.username !== username.value) {
      playSound('broadcast')
    }
  })

  chatStore.subscribe('userJoined', (message) => {
    messages.value.push({
      type: 'notify',
      ...message,
      text: `${message.username} joined the room.`
    })
    setTimeout(updateMessagesList, 150)
    if (message.username !== username.value) {
      playSound('userJoined')
    }
  })

  chatStore.subscribe('userLeft', (message) => {
    messages.value.push({
      type: 'notify',
      ...message,
       text: `${message.username} left the room.`
    })
    if (message.username !== username.value) {
      playSound('userLeft')
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
    <div class="column">
      <q-input v-model="message" placeholder="Message"></q-input>
      <q-btn color="primary" @click="send" label="Send"></q-btn>
    </div>
  </main>
</template>
