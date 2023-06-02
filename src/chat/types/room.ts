export const rooms = ['Lobby', 'Geek Zone', 'Staff'] as const
export type Room = typeof rooms[number]
