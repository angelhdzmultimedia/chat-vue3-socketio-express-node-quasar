import { Controller, Get, Redirect } from '@nestjs/common'
import { ChatService } from './chat.service'
import { Room, rooms } from './types/room'

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('rooms')
  public findRooms(): readonly Room[] {
    return rooms
  }
}
