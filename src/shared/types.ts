import { Message, MessageAttachment, User } from '@common/database/entities';
import { Request } from 'express';

export type FriendRequestStatus = 'accepted' | 'pending' | 'rejected';

export type FriendRequestParams = {
  id: number;
  userId: number;
};

export type CancelFriendRequestParams = {
  id: number;
  userId: number;
};

export type DeleteFriendRequestParams = {
  id: number;
  userId: number;
};

export type UserCredential = {
  username: string;
  password: string;
};

export type FindUserParams = Partial<{
  id: number;
  email: string;
  username: string;
}>;

export type FindUserOptions = Partial<{
  selectAll: boolean;
}>;

export interface AuthenticatedRequest extends Request {
  user: User;
}

export type CreateFriendParams = {
  user: User;
  username: string;
};

export interface Attachment extends Express.Multer.File {}

export type CreateMessageParams = {
  id: number;
  content?: string;
  attachments?: Attachment[];
  user: User;
};

export type EditMessageParams = {
  conversationId: number;
  messageId: number;
  userId: number;
  content: string;
};

export type DeleteMessageParams = {
  userId: number;
  conversationId: number;
  messageId: number;
};

export type GetConversationMessagesParams = {
  id: number;
  limit: number;
};

export type UpdateConversationParams = Partial<{
  id: number;
  lastMessageSent: Message;
}>;

export type FindMessageParams = {
  userId: number;
  conversationId: number;
  messageId: number;
};

export type UploadMessageAttachmentParams = {
  file: Attachment;
  messageAttachment: MessageAttachment;
};

export type AccessParams = {
  id: number;
  userId: number;
};

export type UpdateStatusMessageParams = {
  user: User;
  statusMessage: string;
};

export type UserProfileFiles = Partial<{
  banner: Express.Multer.File[];
  avatar: Express.Multer.File[];
}>;

export type UpdateUserProfileParams = Partial<{
  about: string;
  banner: Express.Multer.File;
  avatar: Express.Multer.File;
}>;

export type UploadImageParams = {
  key: string;
  file: Express.Multer.File;
};
