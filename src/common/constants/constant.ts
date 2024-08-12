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
  MESSAGES = 'conversations/:id/messages',
  FRIENDS = 'friends',
  FRIEND_REQUESTS = 'friends/requests',
}

export enum ServerEvents {
  FRIEND_REQUEST_ACCEPTED = 'friendRequest.accepted',
  FRIEND_REQUEST_CANCELED = 'friendRequest.canceled',
  FRIEND_REQUEST_REJECTED = 'friendRequest.rejected',
  FRIEND_REMOVED = 'friend.removed',
  MESSAGE_UPDATED = 'message.updated',
  MESSAGE_DELETED = 'message.deleted',
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
