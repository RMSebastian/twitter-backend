import { FollowDTO } from "../dto";

export interface FollowerService{
    follow(followerId: string, followedId: string): Promise<FollowDTO>;
    unfollow(followerId: string, followedId: string): Promise<void>;
}