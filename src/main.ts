import express, { Application } from 'express'
import socket, { Socket } from 'socket.io'
import { createServer } from 'http'
import cors from 'cors'

// App de express
const app: Application = express()
app.use(
  cors({
    origin: ['https://localhost:3000'],
  })
)
app.use(express.json())

const rooms = ['Lobby', 'Geek Zone', 'Staff']

app.get('/api/rooms', (req, res) => {
  return res.send(rooms)
})

// Servidor de HTTP
const server = createServer(app)

// Socket Servidor
const serverSocket = new socket.Server(server, {
  cors: {
    origin: ['https://localhost:3000'],
  },
})

serverSocket.on('connection', (clientSocket: Socket) => {
  // Socket Cliente conectado
  console.log('Socket Cliente conectado.')

  // Eventos del Socket Cliente
  clientSocket.on('joinRoom', (message) => {
    console.log(`User ${message.username} joined ${message.room}.`)
    clientSocket.join(message.room)
  })

  clientSocket.on('newMessage', (message) => {
    console.log(`Room: ${clientSocket.rooms}`)
    console.log(`Nuevo evento de Socket Cliente: ${JSON.stringify(message)}`)
    // Emitirlo a todos los Sockets Cliente conectados
    serverSocket.to(message.room).emit('broadcast', {
      username: message.username,
      text: message.text,
    })
  })
})

server.listen(5000, () => {
  console.log('Servidor escuchando en puerto 5000...')
})
