import { AuthModule } from '@modules/auth/auth.module';
import { ConversationModule } from '@modules/conversation/conversation.module';
import { FriendRequestModule } from '@modules/friend-request/friend-request.module';
import { FriendModule } from '@modules/friend/friend.module';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ConversationModule,
    FriendModule,
    FriendRequestModule,
  ],
  providers: [],
})
export class RouterModule {}
