import { UserViewDTO } from '@domains/user/dto';
import { FollowDTO } from '../dto';

export interface FollowerService {
  follow(followerId: string, followedId: string): Promise<UserViewDTO>;
  unfollow(followerId: string, followedId: string): Promise<void>;
}
