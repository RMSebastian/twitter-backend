import { ReactionType } from "@prisma/client";
import { ReactionService } from ".";
import { CreateReactionInputDTO, ReactionDTO } from "../dto";
import { ReactionRepository } from "../repository";
import { ConflictException, NotFoundException } from "@utils";

export class ReactionServiceImpl implements ReactionService{
    constructor(private readonly reactionRepository: ReactionRepository){}
    
    async createReaction(userId: string, postId: string, data: CreateReactionInputDTO): Promise<ReactionDTO> {
        const existingReaction = await this.reactionRepository.getReactionId(userId,postId,data);
        if (existingReaction) throw new ConflictException('REACTION_ALREADY_EXIST')
        return await this.reactionRepository.create(userId,postId, data);
    }
    async deleteReaction(userId: string, postId: string, data: CreateReactionInputDTO): Promise<void> {
        const reactionId = await this.reactionRepository.getReactionId(userId,postId,data);
        if(!reactionId) throw new NotFoundException('reaction');
        await this.reactionRepository.delete(reactionId);
    }
    async getReactionsWithFilter(userId: string, filter: ReactionType | null): Promise<ReactionDTO[]> {
        return await this.reactionRepository.getAllByUserId(userId,filter);
    }
}