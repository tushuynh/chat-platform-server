import { DatabaseModule } from '@common/database/database.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
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
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>('auth.throttle.ttl'),
          limit: configService.get<number>('auth.throttle.limit'),
        },
      ],
    }),
    DatabaseModule,
    EventEmitterModule.forRoot(),
  ],
})
export class CommonModule {}
