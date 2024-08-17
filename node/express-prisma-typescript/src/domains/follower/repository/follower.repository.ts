import { UserDTO, UserViewDTO } from '@domains/user/dto';
import { FollowDTO } from '../dto';

export interface FollowerRepository {
  create(followerId: string, followedId: string): Promise<UserViewDTO>;
  delete(followId: string): Promise<void>;
  getFollowId(followerId: string, followedId: string): Promise<FollowDTO | null>;
  getFollowerIds(followedId: string): Promise<string[]>;
  getFollowerUsers(followedId: string): Promise<UserDTO[]>;
  getFollowedIds(followerId: string): Promise<string[]>;
  getFollowedUsers(followerId: string): Promise<UserDTO[]>;
  getRelationshipsByUserId(followerId: string): Promise<UserViewDTO[]>;
  getRelationshipOfUsers(userId: string, otherUserId: string): Promise<boolean>;
}
