import { User } from './User';
import { Session } from './Session';
import { Conversation } from './Conversation';
import { Message } from './Message';
import { Group } from './Group';
import { GroupMessage } from './GroupMessage';
import { FriendRequest } from './FriendRequest';
import { Friend } from './Friend';
import { Profile } from './Profile';
import { MessageAttachment } from './MessageAttachment';
import { GroupMessageAttachment } from './GroupMessageAttachment';
import { UserPresence } from './UserPresence';
import { Peer } from './Peer';

const entities = [
  User,
  Session,
  Conversation,
  Message,
  Group,
  GroupMessage,
  FriendRequest,
  Friend,
  Profile,
  MessageAttachment,
  GroupMessageAttachment,
  UserPresence,
  Peer,
];

export default entities;

export {
  User,
  Session,
  Conversation,
  Message,
  Group,
  GroupMessage,
  FriendRequest,
  Friend,
  Profile,
  MessageAttachment,
  GroupMessageAttachment,
  UserPresence,
  Peer,
};
