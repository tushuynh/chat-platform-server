import { S3 } from '@aws-sdk/client-s3';
import { Services } from '@common/constants/constant';
import { GroupMessageAttachment } from '@common/database/entities';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Attachment,
  UploadGroupMessageAttachmentParams,
  UploadImageParams,
  UploadMessageAttachmentParams,
} from '@shared/types';
import * as sharp from 'sharp';

@Injectable()
export class ImageStorageService {
  private readonly bucket: string;

  constructor(
    @Inject(Services.AWS_S3)
    private readonly storage: S3,
    private readonly configService: ConfigService
  ) {
    this.bucket = configService.get<string>('storage.bucket');
  }

  async upload(params: UploadImageParams) {
    return this.storage.putObject({
      Bucket: this.bucket,
      Key: params.key,
      Body: params.file.buffer,
      ACL: 'public-read',
      ContentType: params.file.mimetype,
    });
  }

  async uploadMessageAttachment(params: UploadMessageAttachmentParams) {
    this.storage.putObject({
      Bucket: this.bucket,
      Key: `original/${params.messageAttachment.key}`,
      Body: params.file.buffer,
      ACL: 'public-read',
      ContentType: params.file.mimetype,
    });
    await this.storage.putObject({
      Bucket: this.bucket,
      Key: `preview/${params.messageAttachment.key}`,
      Body: await this.compressImage(params.file),
      ACL: 'public-read',
      ContentType: params.file.mimetype,
    });

    return params.messageAttachment;
  }

  async uploadGroupMessageAttachment(
    params: UploadGroupMessageAttachmentParams
  ): Promise<GroupMessageAttachment> {
    this.storage.putObject({
      Bucket: this.bucket,
      Key: `original/${params.messageAttachment.key}`,
      Body: params.file.buffer,
      ACL: 'public-read',
      ContentType: params.file.mimetype,
    });
    await this.storage.putObject({
      Bucket: this.bucket,
      Key: `preview/${params.messageAttachment.key}`,
      Body: await this.compressImage(params.file),
      ACL: 'public-read',
      ContentType: params.file.mimetype,
    });

    return params.messageAttachment;
  }

  compressImage(attachment: Attachment) {
    return sharp(attachment.buffer).resize(300).jpeg().toBuffer();
  }
}
