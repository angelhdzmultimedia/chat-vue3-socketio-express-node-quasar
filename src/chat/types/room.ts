export type Room = {
  name: string
  isLocked: boolean
  password?: string
}

export const rooms: Room[] = [
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
