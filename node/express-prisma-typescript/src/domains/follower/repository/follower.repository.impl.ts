import { PrismaClient } from "@prisma/client";
import { FollowerRepository } from ".";
import { FollowDTO } from "../dto";

export class FollowerRepositoryImpl implements FollowerRepository{
    constructor(private readonly db: PrismaClient){}
    
    async create(followerId: string, followedId: string): Promise<FollowDTO> {
        const follow = await this.db.follow.create({
            data:{
                followerId: followerId,
                followedId: followedId,
            }
        })

        return new FollowDTO(follow);
    }
    async delete(followId: string): Promise<void> {
        await this.db.follow.delete({
            where:{
                id: followId,
            }
        })
    }
    async getFollowId(followerId: string, followedId: string): Promise<FollowDTO | null> {
        const follow = await this.db.follow.findFirst({
            where:{
                followerId: followerId,
                followedId: followedId,
            }
        });
        return (follow) ? new FollowDTO (follow): null;
    }
    async getFollowedIds(followerId:string): Promise<string[]>{

        const follows = await this.db.follow.findMany({
            where:{
                followerId: followerId,
            }
        });
        return follows.map(follow => follow.followedId)
    }
    async getRelationshipsByUserId(followerId: string): Promise<string[]>{
        const follower = await this.db.follow.findMany({
            where:{
                followerId: followerId
            }
        })
        const followed = await this.db.follow.findMany({
            where:{
                followedId: followerId
            }
        })
        let RelatedUserIds: string[] = [];

        follower.forEach((fer)=>{
            followed.forEach((fed)=>{
                if(fer.followedId == fed.followerId){
                    RelatedUserIds.push(fer.followedId);
                    return;
                }
            })
        })

        return RelatedUserIds;
    }
    
}