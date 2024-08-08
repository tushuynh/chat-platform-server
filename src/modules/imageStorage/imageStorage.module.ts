import { Module } from '@nestjs/common';
import { ImageStorageService } from './services/imageStorage.service';
import { S3 } from '@aws-sdk/client-s3';
import { Services } from '@common/constants/constant';
import { ConfigService } from '@nestjs/config';

const awsS3Provider = {
  provide: Services.AWS_S3,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) =>
    new S3({
      credentials: {
        accessKeyId: configService.get<string>('storage.accessKeyId'),
        secretAccessKey: configService.get<string>('storage.secretAccessKey'),
      },
      endpoint: configService.get<string>('storage.endpoint'),
      region: configService.get<string>('storage.region'),
    }),
};

@Module({
  providers: [ImageStorageService, awsS3Provider],
  exports: [ImageStorageService, awsS3Provider],
})
export class ImageStorageModule {}
