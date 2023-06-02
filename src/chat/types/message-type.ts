export const messageTypes = ['newMessage', 'joinRoom'] as const
export type MessageType = typeof messageTypes[number]
