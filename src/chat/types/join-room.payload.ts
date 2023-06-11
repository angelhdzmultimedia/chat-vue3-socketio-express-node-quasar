import { MessagePayload } from './message.payload'
import { Room } from './room'

export type JoinRoomPayload = MessagePayload & {
  room: string
}
