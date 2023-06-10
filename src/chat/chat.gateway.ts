import { Logger } from '@nestjs/common'
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { JoinRoomPayload } from './types/join-room-payload'
import { MessagePayload } from './types/message-payload'
import { MessageType } from './types/message-type'
import { NewMessagePayload } from './types/new-message-payload'
import { Room, rooms } from './types/room'
import { RoomAuthPayload } from './types/room-auth-payload.ts'

type User = {
  username: string
  id: string
  rooms: string[]
}

@WebSocketGateway({
  cors: true,
})
export class ChatGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  public server: Server
  private _users: User[] = []

  private _findUserById(id: string): User {
    return this._users.find((item) => item.id === id)
  }

  // Evento cuando un socket se desconecta por cualquier razon
  handleDisconnect(socket: Socket) {
    const user = this._findUserById(socket.id)

    if (!user) {
      return
    }

    // Crear nuevo payload
    const payload: MessagePayload = {
      username: user.username,
    }

    // Iterar por los rooms del usuario
    for (const room of user.rooms) {
      // Emitir evento usuario salio de room
      this.server.to(room).emit('userLeft', payload)
      // Salir del room si usuario esta en room
      if (socket.in(room)) {
        socket.leave(room)
      }
      // Eliminar room del array de rooms del usuario
      user.rooms.splice(user.rooms.indexOf(room), 1)
    }
    // Eliminar usuario del array de usuarios
    this._users.splice(this._users.indexOf(user), 1)
  }

  @SubscribeMessage<MessageType>('canJoin')
  public canJoin(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: RoomAuthPayload,
  ): boolean {
    const room: Room = rooms.find((item) => item.name === payload.room)

    if (room.isLocked && room.password === payload.password) {
      return true
    }
    return false
  }

  @SubscribeMessage<MessageType>('roomsList')
  public roomsList(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: {},
  ): { rooms: Omit<Room, 'password'>[] } {
    Logger.log(`[New Message - roomsList]: ${payload}`)

    return {
      rooms: rooms.map((item) => ({
        isLocked: item.isLocked,
        name: item.name,
      })),
    }
  }

  @SubscribeMessage<MessageType>('newMessage')
  public newMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: NewMessagePayload,
  ): NewMessagePayload {
    Logger.log(`[New Message - newMessage]: ${payload}`)
    Logger.log(`[ Rooms ]: ${socket.rooms}`)
    // Emitir evento "broadcast" a los sockets cliente que estan en la sala
    this.server.to(payload.room).emit('broadcast', payload)
    return payload
  }

  @SubscribeMessage<MessageType>('newConnect')
  public newConnect(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: MessagePayload,
  ): MessagePayload {
    Logger.log(`[New Message - newConnect]: ${payload}`)
    // Añadir nuevo usuario en array de usuarios
    this._users.push({
      username: payload.username,
      id: socket.id, // ID del socket
      rooms: [],
    })
    return payload
  }

  @SubscribeMessage<MessageType>('joinRoom')
  public joinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: JoinRoomPayload,
  ): JoinRoomPayload {
    Logger.log(`[New Message - joinRoom]: ${payload}`)
    socket.join(payload.room)
    // Emitir evento "userJoined" a los sockets cliente que estan en la sala
    this.server.to(payload.room).emit('userJoined', payload)
    // Buscar un usuario por su id del socket
    const user = this._findUserById(socket.id)
    // Añadir la sala al array de rooms del usuario
    user.rooms.push(payload.room)
    return payload
  }
}
