import { DatabaseModule } from '@common/database/database.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import configs from 'src/configs';

let envFilePath = './env-files/.env.dev';
if (process.env.APP_ENVIRONMENT === 'production')
  envFilePath = './env-files/.env.prd';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configs,
      envFilePath,
    }),
    DatabaseModule,
    EventEmitterModule.forRoot(),
  ],
})
export class CommonModule {}
