export const messageTypes = [
  'newMessage',
  'joinRoom',
  'newConnect',
  'getRooms',
  'getUsers',
  'canJoin',
  'userLeft',
  'newPrivateMessage',
  'isRoomFull',
] as const
export type MessageType = typeof messageTypes[number]
