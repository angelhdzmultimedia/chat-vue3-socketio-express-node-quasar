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
  await chatStore.getRooms()
})

async function joinRoom(room: Room) {
  await chatStore.setRoom(room.name)
  await router.push(`/room/${room.name}`)
}

async function handleRoomClick(event: MouseEvent, room: Room) {
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
            await router.push('/room')
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
  return await joinRoom(room)
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
    <q-spinner
      v-if="chatStore.isRoomsLoading"
      color="primary"
      size="3em"
    ></q-spinner>
    <q-list v-else dense class="q-gutter-y-xs">
      <q-item
        class="column"
        v-for="(room, index) in chatStore.rooms"
        :key="index"
      >
        <q-item-section>
          <q-btn
            style="height: 60px"
            :color="room.isLocked ? 'purple' : 'primary'"
            @click="handleRoomClick($event, room)"
            :label="room.name"
            :icon="room.isLocked ? 'lock' : null"
          ></q-btn>
        </q-item-section>
      </q-item>
    </q-list>
  </main>
</template>
