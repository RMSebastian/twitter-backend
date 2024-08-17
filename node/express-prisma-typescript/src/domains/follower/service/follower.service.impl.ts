import { ConflictException, NotFoundException } from "@utils";
import {FollowerService } from ".";
import { FollowDTO } from "../dto";
import { FollowerRepository } from "../repository";
import { UserViewDTO } from "@domains/user/dto";

export class FollowerServiceImpl implements FollowerService{
    
    constructor(private readonly repository: FollowerRepository){}

    async follow(followerId: string, followedId: string): Promise<UserViewDTO> {
        const existingFollowId = await this.repository.getFollowId(followerId, followedId);
        if(existingFollowId)throw new ConflictException("FOLLOW DTO ALREADY EXIST")
        const follow = await this.repository.create(followerId,followedId);
        return follow;
    }
    async unfollow(followerId: string, followedId: string): Promise<void> {
        const followId = await this.repository.getFollowId(followerId, followedId);
        if(!followId)throw new NotFoundException("follow");
        await this.repository.delete(followId.id);
    }

}