import { Logger } from '@nestjs/common'
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { JoinRoomPayload } from './types/join-room-payload'
import { MessagePayload } from './types/message-payload'
import { MessageType } from './types/message-type'
import { NewMessagePayload } from './types/new-message-payload'

type User = {
  username: string
  socket: Socket
}

@WebSocketGateway({
  cors: true,
})
export class ChatGateway {
  @WebSocketServer()
  public server: Server

  private _users: User[] = []

  @SubscribeMessage<MessageType>('newMessage')
  newMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: NewMessagePayload,
  ): NewMessagePayload {
    Logger.log(`[New Message - newMessage]: ${payload}`)
    Logger.log(`[ Rooms ]: ${socket.rooms}`)
    this.server.to(payload.room).emit('broadcast', payload)
    return payload
  }

  @SubscribeMessage<MessageType>('disconnected')
  disconnected(@ConnectedSocket() socket: Socket): MessagePayload {
    Logger.log(`[New Message - disconnected]: ${null}`)
    const user = this._users.find((item) => item.socket.id === socket.id)
    if (!user) {
      return
    }

    const payload: MessagePayload = {
      username: user.username,
    }
    this._users.splice(this._users.indexOf(user), 1)
    this.server.to(socket.rooms).emit('userLeft', payload)
    return payload
  }

  @SubscribeMessage<MessageType>('connect')
  connect(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: MessagePayload,
  ): MessagePayload {
    Logger.log(`[New Message - connect]: ${payload}`)
    this._users.push({
      username: payload.username,
      socket,
    })
    return payload
  }

  @SubscribeMessage<MessageType>('joinRoom')
  joinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: JoinRoomPayload,
  ): JoinRoomPayload {
    Logger.log(`[New Message - joinRoom]: ${payload}`)
    socket.join(payload.room)
    this.server.to(payload.room).emit('userJoined', payload)
    return payload
  }
}
