import {
  Conversation,
  Friend,
  FriendRequest,
  Group,
  GroupMessage,
  GroupMessageAttachment,
  Message,
  MessageAttachment,
  User,
} from '@common/database/entities';
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

export type AcceptFriendRequestResponse = {
  friend: Friend;
  friendRequest: FriendRequest;
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

export type CreateMessageResponse = {
  message: Message;
  conversation: Conversation;
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

export type UploadGroupMessageAttachmentParams = {
  file: Attachment;
  messageAttachment: GroupMessageAttachment;
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

export type FetchGroupsParams = {
  userId: number;
};

export type CreateGroupParams = {
  creator: User;
  users: string[];
  title?: string;
};

export type UpdateGroupDetailsParams = {
  id: number;
  title?: string;
  avatar?: Attachment;
};

export type TransferGroupOwnerParams = {
  userId: number;
  groupId: number;
  newOwnerId: number;
};

export type CreateGroupMessageParams = {
  author: User;
  attachments: Attachment[];
  content: string;
  groupId: number;
};

export type CreateGroupMessageResponse = {
  message: GroupMessage;
  group: Group;
};

export type EditGroupMessageParams = {
  groupId: number;
  messageId: number;
  userId: number;
  content: string;
};

export type DeleteGroupMessageParams = {
  userId: number;
  groupId: number;
  messageId: number;
};

export type GetGroupMessagesParams = {
  id: number;
  limit: number;
};

export type AddGroupRecipientParams = {
  id: number;
  username: string;
  userId: number;
};

export type AddGroupUserResponse = {
  group: Group;
  user: User;
};

export type RemoveGroupRecipientParams = {
  userId: number;
  groupId: number;
  removeUserId: number;
};

export type RemoveGroupUserResponse = {
  group: Group;
  user: User;
};

export type LeaveGroupParams = {
  id: number;
  userId: number;
};

export type LeaveGroupEventPayload = {
  group: Group;
  userId: number;
};

export type CheckUserGroupParams = {
  id: number;
  userId: number;
};
