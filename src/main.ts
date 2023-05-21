import { NestFactory } from '@nestjs/core';
import { AppModule } from './compressor.module';
import { PORT } from './config/environment-contants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(PORT);
}
bootstrap();
