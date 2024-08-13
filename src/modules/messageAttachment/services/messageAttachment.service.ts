import {
  GroupMessageAttachment,
  MessageAttachment,
} from '@common/database/entities';
import { ImageStorageService } from '@modules/imageStorage/services/imageStorage.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Attachment } from '@shared/types';
import { Repository } from 'typeorm';

@Injectable()
export class MessageAttachmentService {
  constructor(
    @InjectRepository(MessageAttachment)
    private readonly messageAttachmentRepository: Repository<MessageAttachment>,
    @InjectRepository(GroupMessageAttachment)
    private readonly groupMessageAttachmentRepository: Repository<GroupMessageAttachment>,
    private readonly imageStorageService: ImageStorageService
  ) {}

  create(attachments: Attachment[]): Promise<MessageAttachment[]> {
    const promises = attachments.map((attachment) => {
      const newAttachment = this.messageAttachmentRepository.create();
      return this.messageAttachmentRepository
        .save(newAttachment)
        .then((messageAttachment) =>
          this.imageStorageService.uploadMessageAttachment({
            messageAttachment,
            file: attachment,
          })
        );
    });

    return Promise.all(promises);
  }

  createGroupAttachments(
    attachments: Attachment[]
  ): Promise<GroupMessageAttachment[]> {
    const promises = attachments.map((attachment) => {
      const newAttachment = this.groupMessageAttachmentRepository.create();
      return this.groupMessageAttachmentRepository
        .save(newAttachment)
        .then((messageAttachment) =>
          this.imageStorageService.uploadGroupMessageAttachment({
            messageAttachment,
            file: attachment,
          })
        );
    });

    return Promise.all(promises);
  }
}
