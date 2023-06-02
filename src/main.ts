import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('api')
  app.enableCors({
    origin: ['https://localhost:3000'],
    methods: ['GET', 'POST'],
  })
  await app.listen(5000)
}
bootstrap()
