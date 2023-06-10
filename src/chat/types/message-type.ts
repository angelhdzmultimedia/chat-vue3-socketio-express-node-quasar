export const messageTypes = [
  'newMessage',
  'joinRoom',
  'disconnected',
  'connect',
] as const
export type MessageType = typeof messageTypes[number]
