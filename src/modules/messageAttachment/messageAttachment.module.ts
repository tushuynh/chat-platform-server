import { Module } from '@nestjs/common';
import { MessageAttachmentService } from './services/messageAttachment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  GroupMessageAttachment,
  MessageAttachment,
} from '@common/database/entities';
import { ImageStorageModule } from '@modules/imageStorage/imageStorage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageAttachment, GroupMessageAttachment]),
    ImageStorageModule,
  ],
  providers: [MessageAttachmentService],
  exports: [MessageAttachmentService],
})
export class MessageAttachmentModule {}
