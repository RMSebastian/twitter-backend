import { UserDTO } from "@domains/user/dto";
import { FollowDTO } from "../dto";

export interface FollowerRepository{
    create(followerId: string, followedId: string): Promise<FollowDTO>;
    delete(followId: string): Promise<void>;
    getFollowId(followerId: string, followedId: string): Promise<FollowDTO | null>;
    getFollowedIds(followerId:string): Promise<string[]>
    getRelationshipsByUserId(followerId: string): Promise<UserDTO[]>
    getRelationshipOfUsers(userId: string, otherUserId:string): Promise<boolean>
}