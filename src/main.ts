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
  const firstSpawn = spawn('pnpm', ['-C', 'client', 'install']).on(
    'exit',
    () => {
      Logger.log('Client dependencies installed.')
      const secondSpawn = spawn('pnpm', ['-C', 'client', 'dev'], {
        stdio: 'inherit',
      }).on('spawn', async () => {
        Logger.log('Starting client...')
      })
    },
  )
}
bootstrap()
