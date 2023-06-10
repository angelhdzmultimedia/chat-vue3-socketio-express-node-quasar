import { MessagePayload } from './message.payload'

export type JoinRoomPayload = MessagePayload & {
  room: string
}
