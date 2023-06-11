<script setup lang="ts">
import { router } from '../router'
import { ref, onMounted, nextTick, onUpdated } from 'vue'
import { useChatStore } from '../stores/chat'
import { useSoundStore } from '../stores/sound'
import {useRoute} from 'vue-router'

const soundStore = useSoundStore()
const chatStore = useChatStore()
const message = ref('')
const route = useRoute()
const room = ref(route.params.room)
const messages = ref([])
const messagesList = ref(null)
const leftDrawerOpen = ref(false)

function updateMessagesList() {
  const element = messagesList.value?.$el.lastElementChild?.scrollIntoView({
    behavior: 'smooth',
  })
}

function toggleUsersList() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function handleSendButtonClick() {
  chatStore.sendMessage(message.value)
  message.value = ''
}

// Life Cycle Hooks


onMounted(async () => {
  await chatStore.joinRoom()
  await chatStore.getUsers()
   
  chatStore.subscribe('broadcast', (message) => {
    messages.value.push({
      type: 'message',
      ...message,
    })

    setTimeout(updateMessagesList, 150)

    if (message.user !== chatStore.user.name) {
      soundStore.play('broadcast')
    }
  })

  chatStore.subscribe('userJoined', (message) => {
    messages.value.push({
      type: 'notify',
      ...message,
      text: `${message.user} joined the room.`,
    })

    setTimeout(updateMessagesList, 150)

    if (message.user !== chatStore.user.name) {
      soundStore.play('userJoined')
    }
  })

  chatStore.subscribe('userLeft', (message) => {
    messages.value.push({
      type: 'notify',
      ...message,
      text: `${message.user} left the room.`,
    })

    if (message.user !== chatStore.user.name) {
      soundStore.play('userLeft')
    }
  })
})
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-drawer
      class="column q-pa-lg text-center"
      v-model="leftDrawerOpen"
      side="left"
      overlay
      bordered
    >
          <q-spinner
      v-if="chatStore.isUsersLoading"
      color="primary"
      size="3em"
    ></q-spinner>
      <div v-else>
      <span class="text-h6">Users {{chatStore.users.length}}/100</span>
      <span class="text-grey" v-if="!chatStore.users.length">{{'<Empty>'}}</span>
      <q-list v-else>
        <q-item v-for="(user, index) in users" :key="index">
          {{ user.name }}
        </q-item>
      </q-list>
      </div>
    </q-drawer>

    <q-page-container>
      <q-page class="column full-width full-height justify-between q-pa-lg">
        <div class="column q-gutter-y-sm">
          <span
            >Connected as:
            <span class="text-bold text-primary">{{ chatStore.user.name }}</span></span
          >

          <span class="text-h4 text-primary">{{ chatStore.user.room?.name }}</span>
          <q-btn flat color="white" @click="toggleUsersList" label="Users List"></q-btn>
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
                >{{ message.user }}:&nbsp;</span
              >
              <span class="text-black">{{ message.text }}</span>
            </div>
          </q-item>
        </q-list>
        <div class="column q-pb-md">
          <q-input v-model="message" label="Message"></q-input>
          <q-btn color="primary" @click="handleSendButtonClick" label="Send"></q-btn>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>
