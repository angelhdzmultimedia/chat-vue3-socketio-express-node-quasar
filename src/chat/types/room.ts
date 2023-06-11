export type _Room = {
  name: string
  isLocked: boolean
  password?: string
}

export type Room = Omit<_Room, 'password'>

export const rooms: _Room[] = [
  {
    name: 'Lobby',
    isLocked: false,
  },
  {
    name: 'Geek Zone',
    isLocked: false,
  },

  {
    name: 'Staff',
    isLocked: true,

    password: '123456789',
  },
]
