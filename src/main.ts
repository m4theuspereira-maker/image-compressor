import { NestFactory } from '@nestjs/core';
import { PORT } from './config/environment-contants';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Image Compressor')
    .setDescription('Compressor of image by link')
    .setVersion('1.0')
    .build();

  const documment = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documment);

  await app.listen(PORT);
}
bootstrap();
