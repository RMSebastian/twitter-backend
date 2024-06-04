import { PrismaClient, ReactionType} from "@prisma/client";
import { ReactionRepository } from ".";
import { CreateReactionInputDTO, ReactionDTO } from "../dto";

export class ReactionRepositoryImpl implements ReactionRepository{
    constructor(private readonly db: PrismaClient){}

    async create(userId: string, postId: string, data: CreateReactionInputDTO): Promise<ReactionDTO> {
        const reaction = await this.db.reaction.create({
            data:{
                userId: userId,
                postId: postId,
                ...data
            }
        });

        return new ReactionDTO(reaction)
    }
    async delete(reactionId: string): Promise<void> {
        await this.db.reaction.delete({
            where:{
                id: reactionId
            }
        });
    }
    async getReactionId(userId: string,postId: string, data: CreateReactionInputDTO): Promise<string | null> {
        const reaction = await this.db.reaction.findFirst({
            where:{
                userId: userId,
                postId: postId,
                ...data
            }
        });
        return (reaction) ? reaction.id: null;
    }
    async getAllByUserId(userId: string, filter: ReactionType | null): Promise<ReactionDTO[]> {

        const reaction: ReactionDTO[] = await this.db.reaction.findMany({
            where: {
                userId: userId,
                ...(filter !== null && { type: filter })
            }
        });
    
        return reaction.map(reaction => new ReactionDTO(reaction));
    }
}