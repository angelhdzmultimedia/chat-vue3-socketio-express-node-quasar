export const messageTypes = ['newMessage', 'joinRoom', 'newConnect'] as const
export type MessageType = typeof messageTypes[number]
