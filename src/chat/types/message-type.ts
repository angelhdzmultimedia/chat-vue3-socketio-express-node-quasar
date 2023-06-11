export const messageTypes = [
  'newMessage',
  'joinRoom',
  'newConnect',
  'getRooms',
  'getUsers',
  'canJoin',
  'userLeft',
] as const
export type MessageType = typeof messageTypes[number]
