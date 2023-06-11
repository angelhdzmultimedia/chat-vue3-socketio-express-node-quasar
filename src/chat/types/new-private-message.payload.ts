import { JoinRoomPayload } from './join-room.payload'
import { MessagePayload } from './message.payload'

export type NewPrivateMessagePayload = JoinRoomPayload & {
  sender: string
  receiver: string
  text: string
}
