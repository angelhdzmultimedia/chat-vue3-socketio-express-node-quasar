<script setup lang="ts">
import { router } from '../router'
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useChatStore } from '../stores/chat'
import { Room } from '../../../src/types/room'
import { Dialog, Notify } from 'quasar'
import RoomAuthDialog from '@/components/room-auth-dialog.vue'

const chatStore = useChatStore()
const rooms = ref<Omit<Room, 'password'>[]>([])
const route = useRoute()

onMounted(async () => {
  //const response = await fetch('https://localhost:5000/api/chat/rooms')
  //const data = await response.json()
  // rooms.value = data

  chatStore.emit('roomsList', {}, (message) => {
    rooms.value = message.rooms
  })
})

async function joinRoom(room: Room) {
  if (room.isLocked) {
    return Dialog.create({
      component: RoomAuthDialog,
      cancel: true,
      persistent: true,
    }).onOk(async (password) => {
      chatStore.emit(
        'canJoin',
        {
          password,
          roomName: room.name,
        },
        async (canJoin) => {
          if (canJoin) {
            await router.push(
              `/room?username=${route.query.username}&room=${room.name}`,
            )
          } else {
            Notify.create({
              message: "You don't have permission to join this room.",
              type: 'negative',
              title: 'Unauthorized',
            })
          }
        },
      )
    })
  }
  return await router.push(
    `/room?username=${route.query.username}&room=${room.name}`,
  )
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
            :color="room.isLocked ? 'purple' : 'primary'"
            @click="joinRoom(room)"
            :label="room.name"
            :icon="room.isLocked ? 'lock' : null"
          ></q-btn>
        </q-item-section>
      </q-item>
    </q-list>
  </main>
</template>
