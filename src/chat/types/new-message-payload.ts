import { JoinRoomPayload } from './join-room-payload'
import { MessagePayload } from './message-payload'

export type NewMessagePayload = MessagePayload &
  JoinRoomPayload & {
    text: string
  }
