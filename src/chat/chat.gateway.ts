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
import { JoinRoomPayload } from './types/join-room.payload'
import { MessagePayload } from './types/message.payload'
import { MessageType } from './types/message-type'
import { NewMessagePayload } from './types/new-message.payload'
import { Room, _Room, rooms } from './types/room'
import { RoomAuthPayload } from './types/room-auth.payload'
import { User } from './types/user'

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

  private _findUserByName(name: string) {
    return this._users.find((item) => item.name === name)
  }

  // Evento cuando un socket se desconecta por cualquier razon
  public handleDisconnect(socket: Socket) {
    const user = this._findUserById(socket.id)

    if (!user || !user.room) {
      return
    }

    // Crear nuevo payload
    const payload: MessagePayload = {
      user: user.name,
    }

    // Emitir evento usuario salio de room
    this.server.to(user.room.name).emit('userLeft', payload)
    // Salir del room si usuario esta en room
    if (socket.in(user.room.name)) {
      socket.leave(user.room.name)
    }
    // Eliminar room del usuario
    user.room = undefined

    // Eliminar usuario del array de usuarios
    this._users.splice(this._users.indexOf(user), 1)
  }

  @SubscribeMessage<MessageType>('canJoin')
  public canJoin(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: RoomAuthPayload,
  ): boolean {
    const room: _Room = rooms.find((item) => item.name === payload.room)

    if (room.isLocked && room.password === payload.password) {
      return true
    }
    return false
  }

  @SubscribeMessage<MessageType>('getUsers')
  public getUsers(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: {},
  ) {
    Logger.log(`[New Message - getUsers]: ${payload}`)
    return this._users
  }

  @SubscribeMessage<MessageType>('getRooms')
  public getRooms(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: {},
  ): { rooms: Room[] } {
    Logger.log(`[New Message - getRooms]: ${payload}`)

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
  ): User {
    Logger.log(`[New Message - newConnect]: ${payload}`)
    // Añadir nuevo usuario en array de usuarios
    const user: User = {
      name: payload.user,
      id: socket.id, // ID del socket
    }
    this._users.push(user)
    return user
  }

  @SubscribeMessage<MessageType>('joinRoom')
  public joinRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: JoinRoomPayload,
  ): { room: Room } {
    Logger.log(`[New Message - joinRoom]: ${payload}`)
    socket.join(payload.room)
    // Emitir evento "userJoined" a los sockets cliente que estan en la sala
    this.server.to(payload.room).emit('userJoined', payload)
    // Buscar un usuario por su id del socket

    const user = this._findUserByName(payload.user)

    // Añadir la sala al array de rooms del usuario
    const room: Room | undefined = rooms
      .map((item) => ({
        isLocked: item.isLocked,
        name: item.name,
      }))
      .find((item) => item.name === payload.room)
    user.room = room ?? undefined
    return {
      room,
    }
  }
}
//
