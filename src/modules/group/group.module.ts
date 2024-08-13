import { Module } from '@nestjs/common';
import { GroupController } from './controllers/group.controller';
import { GroupService } from './services/group.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group, GroupMessage } from '@common/database/entities';
import { UserModule } from '@modules/user/user.module';
import { GroupMessageController } from './controllers/groupMessage.controller';
import { GroupMessageService } from './services/groupMessage.service';
import { ImageStorageModule } from '@modules/imageStorage/imageStorage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group, GroupMessage]),
    UserModule,
    ImageStorageModule,
  ],
  controllers: [GroupController, GroupMessageController],
  providers: [GroupService, GroupMessageService],
  exports: [GroupService, GroupMessageService],
})
export class GroupModule {}
