import { S3 } from '@aws-sdk/client-s3';
import { Services } from '@common/constants/constant';
import { Inject, Injectable } from '@nestjs/common';
import {
  Attachment,
  UploadImageParams,
  UploadMessageAttachmentParams,
} from '@shared/types';
import * as sharp from 'sharp';

@Injectable()
export class ImageStorageService {
  constructor(
    @Inject(Services.AWS_S3)
    private readonly storage: S3
  ) {}

  async upload(params: UploadImageParams) {
    return this.storage.putObject({
      Bucket: 'chat-platform-storage',
      Key: params.key,
      Body: params.file.buffer,
      ACL: 'public-read',
      ContentType: params.file.mimetype,
    });
  }

  async uploadMessageAttachment(params: UploadMessageAttachmentParams) {
    this.storage.putObject({
      Bucket: 'chat-platform-storage',
      Key: `original/${params.messageAttachment.key}`,
      Body: params.file.buffer,
      ACL: 'public-read',
      ContentType: params.file.mimetype,
    });
    await this.storage.putObject({
      Bucket: 'chat-platform-storage',
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
