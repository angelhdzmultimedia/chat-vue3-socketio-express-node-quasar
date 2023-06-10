export const messageTypes = ['newMessage', 'joinRoom', 'newConnect', 'roomsList'] as const
export type MessageType = typeof messageTypes[number]
