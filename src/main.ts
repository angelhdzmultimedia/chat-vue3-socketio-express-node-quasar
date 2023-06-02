import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import axios from 'axios'
import { spawn } from 'child_process'
import { Logger } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('api')
  app.enableCors({
    origin: ['https://localhost:3000', 'https://localhost:5000'],
    methods: ['GET', 'POST'],
  })
  await app.listen(5000, () => {})
  spawn('pnpm', ['-C', 'client', 'install']).on('exit', () => {
    Logger.log('Client dependencies installed.')
    spawn('pnpm', ['-C', 'client', 'dev']).on('exit', async () => {
      Logger.log('Client listening on port 3000...')
      Logger.log(
        'Redirecting to "https://stackblitzstartersniszps-zydv--3000--e0a2bd6c.local-credentialless.webcontainer.io"...',
      )
      await axios.get(
        'https://stackblitzstartersniszps-zydv--3000--e0a2bd6c.local-credentialless.webcontainer.io',
      )
    })
  })
}
bootstrap()
