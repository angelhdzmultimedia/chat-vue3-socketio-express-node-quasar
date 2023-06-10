import { ref } from 'vue'
import { defineStore } from 'pinia'
import { io } from 'socket.io-client'

const messageTypes = [
  'newMessage',
  'joinRoom',
  'userJoined',
  'broadcast',
  'newConnect',
] as const
type MessageType = typeof messageTypes[number]

export const useChatStore = defineStore('chat', () => {
  const chat = ref(io('ws://localhost:5000'))

  function connect(username: string) {
    emit('newConnect', { username })
  }

  function emit(event: MessageType, ...args: any[]) {
    chat.value.emit(event, ...args)
  }

  function subscribe(event: MessageType, callback) {
    chat.value.on(event, callback)
  }

  return {
    chat,
    connect,
    emit,
    subscribe,
  }
})
