import { ReactionType } from "@prisma/client";
import { ReactionService } from ".";
import { CreateReactionInputDTO, ReactionDTO } from "../dto";
import { ReactionRepository } from "../repository";

export class ReactionServiceImpl implements ReactionService{
    constructor(private readonly reactionRepository: ReactionRepository){}
    
    async createReaction(userId: string, postId: string, data: CreateReactionInputDTO): Promise<ReactionDTO> {
        return await this.reactionRepository.create(userId,postId, data);
    }
    async deleteReaction(userId: string, postId: string, data: CreateReactionInputDTO): Promise<void> {
        await this.reactionRepository.delete(userId,postId);
    }
    async getReactionsWithFilter(userId: string, filter: ReactionType | null): Promise<ReactionDTO[]> {
        return await this.reactionRepository.getAllByUserId(userId,filter);
    }
}