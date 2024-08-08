import { MessageAttachment } from '@common/database/entities';
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
}
