import { AuthModule } from '@modules/auth/auth.module';
import { ConversationModule } from '@modules/conversation/conversation.module';
import { FriendRequestModule } from '@modules/friend-request/friend-request.module';
import { FriendModule } from '@modules/friend/friend.module';
import { MessageModule } from '@modules/messages/message.module';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ConversationModule,
    FriendModule,
    FriendRequestModule,
    MessageModule,
  ],
  providers: [],
})
export class RouterModule {}
