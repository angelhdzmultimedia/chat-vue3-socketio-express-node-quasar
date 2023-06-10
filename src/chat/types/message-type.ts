export const messageTypes = [
  'newMessage',
  'joinRoom',
  'newConnect',
  'roomsList',
  'canJoin',
] as const
export type MessageType = typeof messageTypes[number]
