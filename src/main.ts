import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3000;

  const logger = new Logger(AppModule.name);

  await app.listen(port, 'localhost');

  logger.log(`Server running on http://localhost:${port}`);
}
bootstrap();
