import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port');
  const globalPrefix = configService.get<string>('app.globalPrefix');

  const logger = new Logger(AppModule.name);

  app.setGlobalPrefix(globalPrefix);

  await app.listen(port, 'localhost');

  logger.log(`Server running on http://localhost:${port}${globalPrefix}`);
}
bootstrap();
