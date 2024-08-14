import { Module } from '@nestjs/common';
import { ExistController } from './exist.controller';
import { ConversationModule } from '@modules/conversation/conversation.module';
import { UserModule } from '@modules/user/user.module';

@Module({
  imports: [ConversationModule, UserModule],
  controllers: [ExistController],
  providers: [],
})
export class ExistModule {}
