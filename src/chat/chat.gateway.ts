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
import { NewPrivateMessagePayload } from './types/new-private-message.payload'
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

  private async _findSocketById(
    id: string,
    room: string,
  ): Promise<Socket | undefined> {
    const sockets = await this.server.in(room).fetchSockets()

    for (const socket of sockets) {
      if (socket.id === id) {
        return socket as unknown as Socket
      }
    }
    return undefined
  }

  private _userLeft(socket: Socket) {
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

  // Evento cuando un socket se desconecta por cualquier razon
  public handleDisconnect(socket: Socket) {
    this._userLeft(socket)
  }

  @SubscribeMessage<MessageType>('userLeft')
  public userLeft(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: JoinRoomPayload,
  ) {
    this._userLeft(socket)
  }

  @SubscribeMessage<MessageType>('isRoomFull')
  public isRoomFull(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: JoinRoomPayload,
  ): { isRoomFull: boolean } {
    const items = this._users.filter((item) => item.room?.name === payload.room)
    const room = rooms.find((item) => item.name === payload.room)

    if (items.length >= room.maxUsers) {
      return { isRoomFull: true }
    }
    return { isRoomFull: false }
  }

  @SubscribeMessage<MessageType>('canJoin')
  public canJoin(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: RoomAuthPayload,
  ): { canJoin: boolean } {
    const room: _Room = rooms.find((item) => item.name === payload.room)

    if (room.isLocked && room.password === payload.password) {
      return { canJoin: true }
    }
    return { canJoin: false }
  }

  @SubscribeMessage<MessageType>('getUsers')
  public getUsers(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: {},
  ): { users: User[] } {
    Logger.log(`[New Message - getUsers]: ${payload}`)
    return { users: this._users }
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
        maxUsers: item.maxUsers,
      })),
    }
  }

  @SubscribeMessage<MessageType>('newPrivateMessage')
  public async newPrivateMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: NewPrivateMessagePayload,
  ) {
    Logger.log(`[ New Message - private ] ${JSON.stringify(payload)}`)
    const senderUser = this._findUserByName(payload.receiver)
    const receiverUser = this._findUserByName(payload.sender)
    Logger.log(`[User] ${JSON.stringify(receiverUser)}`)
    if (!receiverUser || !senderUser) {
      return
    }

    const receiverSocket = await this._findSocketById(
      receiverUser.id,
      payload.room,
    )

    const senderSocket = await this._findSocketById(senderUser.id, payload.room)

    if (!receiverSocket || !senderSocket) {
      return
    }

    Logger.log(`[Socket] ${receiverSocket}`)
    receiverSocket.to(payload.room).emit('newPrivateMessage', payload)
    senderSocket.to(payload.room).emit('newPrivateMessage', payload)
  }

  @SubscribeMessage<MessageType>('newMessage')
  public newMessage(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: NewPrivateMessagePayload,
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
    Logger.log(`[New Message - joinRoom]: ${payload.room}`)
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
        maxUsers: item.maxUsers,
      }))
      .find((item) => item.name === payload.room)
    user.room = room ?? undefined
    return {
      room,
    }
  }
}
