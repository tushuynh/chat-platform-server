import { MessageAttachment, User } from '@common/database/entities';
import { Request } from 'express';

export type FriendRequestStatus = 'accepted' | 'pending' | 'rejected';

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

export type FriendRequestParams = {
  id: number;
  userId: number;
};

export interface Attachment extends Express.Multer.File {}

export type CreateMessageParams = {
  id: number;
  content?: string;
  attachments?: Attachment[];
  user: User;
};

export type UploadMessageAttachmentParams = {
  file: Attachment;
  messageAttachment: MessageAttachment;
};

export type AccessParams = {
  id: number;
  userId: number;
};
