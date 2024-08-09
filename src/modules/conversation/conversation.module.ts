import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './services/conversation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation, Message } from '@common/database/entities';
import { UserModule } from '@modules/user/user.module';
import { FriendModule } from '@modules/friend/friend.module';
import { ConversationMiddleware } from './middlewares/conversation.middleware';
import { isAuthorized } from '@common/middlewares/isAuthorized.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message]),
    UserModule,
    FriendModule,
  ],
  controllers: [ConversationController],
  providers: [ConversationService],
  exports: [ConversationService],
})
export class ConversationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(isAuthorized, ConversationMiddleware)
      .forRoutes('conversations/:id');
  }
}
