export enum APP_ENVIRONMENT {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

export enum Routes {
  AUTH = 'auth',
  USERS = 'users',
  USERS_PRESENCE = 'users/presence',
  CONVERSATIONS = 'conversations',
  MESSAGES = 'conversations/:id/messages',
  FRIENDS = 'friends',
  FRIEND_REQUESTS = 'friends/requests',
}

export enum ServerEvents {
  FRIEND_REQUEST_ACCEPTED = 'friendrequest.accepted',
}

export enum Services {
  AWS_S3 = 'AWS_S3',
}
