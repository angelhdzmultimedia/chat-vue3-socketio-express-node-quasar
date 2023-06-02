import { Logger } from '@nestjs/common'
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

const messageTypes = ['newMessage', 'joinRoom'] as const
type MessageType = typeof messageTypes[number]

type MessagePayload = {
  username: string
}

type JoinRoomPayload = MessagePayload & {
  room: string
}

type NewMessagePayload = MessagePayload &
  JoinRoomPayload & {
    text: string
  }

@WebSocketGateway({
  cors: true,
})
export class ChatGateway {
  @WebSocketServer()
  public server: Server

  @SubscribeMessage<MessageType>('newMessage')
  newMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: NewMessagePayload,
  ): NewMessagePayload {
    Logger.log(`[New Message - newMessage]: ${payload}`)
    Logger.log(`[ Rooms ]: ${client.rooms}`)
    this.server.to(payload.room).emit('broadcast', payload)
    return payload
  }

  @SubscribeMessage<MessageType>('joinRoom')
  joinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: JoinRoomPayload,
  ): JoinRoomPayload {
    Logger.log(`[New Message - joinRoom]: ${payload}`)
    client.join(payload.room)
    this.server.to(payload.room).emit('userJoined', payload)
    return payload
  }
}
