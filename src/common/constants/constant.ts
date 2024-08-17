import { MulterField } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export enum APP_ENVIRONMENT {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

export enum Routes {
  AUTH = 'auth',
  USERS = 'users',
  USERS_PRESENCE = 'users/presence',
  USERS_PROFILES = 'users/profiles',
  CONVERSATIONS = 'conversations',
  GROUPS = 'groups',
  GROUPS_MESSAGES = 'groups/:id/messages',
  GROUPS_RECIPIENTS = 'groups/:id/recipients',
  MESSAGES = 'conversations/:id/messages',
  FRIENDS = 'friends',
  FRIEND_REQUESTS = 'friends/requests',
  EXISTS = 'exists',
}

export enum ServerEvents {
  FRIEND_REQUEST_CREATED = 'friendRequest.created',
  FRIEND_REQUEST_ACCEPTED = 'friendRequest.accepted',
  FRIEND_REQUEST_CANCELLED = 'friendRequest.cancelled',
  FRIEND_REQUEST_REJECTED = 'friendRequest.rejected',
  FRIEND_REMOVED = 'friend.removed',
  CONVERSATION_CREATED = 'conversation.created',
  MESSAGE_CREATED = 'message.created',
  MESSAGE_UPDATED = 'message.updated',
  MESSAGE_DELETED = 'message.deleted',
  GROUP_CREATED = 'group.created',
  GROUP_OWNER_UPDATED = 'group.owner.updated',
  GROUP_MESSAGE_CREATED = 'group.message.created',
  GROUP_MESSAGE_UPDATED = 'group.message.updated',
  GROUP_MESSAGE_DELETED = 'group.message.deleted',
  GROUP_USER_ADDED = 'group.user.added',
  GROUP_USER_LEFT = 'group.user.left',
  GROUP_USER_REMOVED = 'group.user.removed',
}

export enum Services {
  AWS_S3 = 'AWS_S3',
}

export const UserProfileFileFields: MulterField[] = [
  {
    name: 'banner',
    maxCount: 1,
  },
  {
    name: 'avatar',
    maxCount: 1,
  },
];
