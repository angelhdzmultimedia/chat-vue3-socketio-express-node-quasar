export const messageTypes = [
  'newMessage',
  'joinRoom',
  'newConnect',
  'getRooms',
  'getUsers',
  'canJoin',
] as const
export type MessageType = typeof messageTypes[number]
