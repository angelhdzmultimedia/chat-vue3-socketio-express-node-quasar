export type _Room = {
  name: string
  isLocked: boolean
  password?: string
  maxUsers: number
}

export type Room = Omit<_Room, 'password'>

export const rooms: _Room[] = [
  {
    name: 'Lobby',
    isLocked: false,
    maxUsers: 2,
  },
  {
    name: 'Geek Zone',
    isLocked: false,
    maxUsers: 100,
  },

  {
    name: 'Staff',
    isLocked: true,

    password: '123456789',
    maxUsers: 100,
  },
]
