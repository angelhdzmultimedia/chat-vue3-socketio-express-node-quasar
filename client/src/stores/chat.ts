import { ref } from 'vue'
import { defineStore } from 'pinia'
import { io } from 'socket.io-client'
import { Room } from 'src/chat/types/room'
import { User } from 'src/chat/types/user'

const messageTypes = [
  'newMessage',
  'joinRoom',
  'userJoined',
  'broadcast',
  'newConnect',
  'getRooms',
  'getUser',
  'getUsers',
] as const
type MessageType = typeof messageTypes[number]

export const useChatStore = defineStore('chat', () => {
  const chat = ref(io('ws://localhost:5000'))
  const users = ref([])
  const isConnected = ref(false)
  const rooms = ref([])
  const user = ref<User>({})
  const isRoomsLoading = ref(false)
  const isUsersLoading = ref(false)
  const _room = ref('')
  const joined = ref(false)

  function connect(username: string) {
    emit('newConnect', { user: username }, (message) => {
      user.value = { ...message }
      isConnected.value = true
    })
  }

  async function setRoom(room: string) {
    _room.value = room
  }

  function emit(event: MessageType, ...args: any[]) {
    chat.value.emit(event, ...args)
  }

  function joinRoom() {
    return new Promise((resolve) => {
      emit(
        'joinRoom',
        { room: _room.value, user: user.value.name },
        (message) => {
          user.value.room = message.room
          joined.value = true
          resolve(null)
        },
      )
    })
  }

  function subscribe(event: MessageType, callback) {
    chat.value.on(event, callback)
  }

  function getUser(username: string) {
    emit('getUser', { user: username }, (message) => {
      user.value = message.user
    })
  }

  function getUsers() {
    return new Promise((resolve) => {
      isUsersLoading.value = true
      emit('getUsers', {}, (message) => {
        users.value = [...message.users]
        isUsersLoading.value = false
        resolve(null)
      })
    })
  }

  function getRooms() {
    isRoomsLoading.value = true
    emit('getRooms', {}, (message) => {
      rooms.value = [...message.rooms]
      isRoomsLoading.value = false
    })
  }

  function sendMessage(text: string) {
    emit('newMessage', {
      text,
      user: user.value.name,
      room: user.value.room?.name,
    })
  }

  return {
    joined,
    setRoom,
    sendMessage,
    joinRoom,
    chat,
    connect,
    emit,
    subscribe,
    isConnected,
    users,
    getRooms,
    rooms,
    user,
    getUser,
    isRoomsLoading,
    isUsersLoading,
    getUsers,
  }
})
