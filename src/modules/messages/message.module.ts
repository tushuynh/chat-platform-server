import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './services/message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from '@common/database/entities';
import { ConversationModule } from '@modules/conversation/conversation.module';
import { FriendModule } from '@modules/friend/friend.module';
import { MessageAttachmentModule } from '@modules/messageAttachment/messageAttachment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    ConversationModule,
    FriendModule,
    MessageAttachmentModule,
  ],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
