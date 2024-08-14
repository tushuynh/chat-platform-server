import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { GroupController } from './controllers/group.controller';
import { GroupService } from './services/group.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group, GroupMessage } from '@common/database/entities';
import { UserModule } from '@modules/user/user.module';
import { GroupMessageController } from './controllers/groupMessage.controller';
import { GroupMessageService } from './services/groupMessage.service';
import { ImageStorageModule } from '@modules/imageStorage/imageStorage.module';
import { isAuthorized } from '@common/middlewares/isAuthorized.middleware';
import { GroupMiddleware } from './middlewares/group.middleware';
import { MessageAttachmentModule } from '@modules/messageAttachment/messageAttachment.module';
import { GroupRecipientController } from './controllers/groupRecipient.controller';
import { GroupRecipientService } from './services/groupRecipient.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group, GroupMessage]),
    UserModule,
    ImageStorageModule,
    MessageAttachmentModule,
  ],
  controllers: [
    GroupController,
    GroupMessageController,
    GroupRecipientController,
  ],
  providers: [GroupService, GroupMessageService, GroupRecipientService],
  exports: [GroupService],
})
export class GroupModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(isAuthorized, GroupMiddleware).forRoutes('groups/:id');
  }
}
