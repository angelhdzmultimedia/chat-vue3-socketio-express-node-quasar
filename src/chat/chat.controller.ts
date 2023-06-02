import { Controller, Get } from '@nestjs/common'
import { ChatService } from './chat.service'

const rooms = ['Lobby', 'Geek Zone', 'Staff'] as const
type Room = typeof rooms[number]

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('rooms')
  public findRooms(): readonly Room[] {
    return rooms
  }
}
