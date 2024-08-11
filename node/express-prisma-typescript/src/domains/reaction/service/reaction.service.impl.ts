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
    async deleteReaction(reactionId: string): Promise<void> {
        const reaction = await this.reactionRepository.getReactionById(reactionId);
        if(!reaction) throw new NotFoundException('follow')
        await this.reactionRepository.delete(reaction.id);
    }
    async getReactionsWithFilter(userId: string, filter: ReactionType | null): Promise<ReactionDTO[]> {
        return await this.reactionRepository.getAllByUserId(userId,filter);
    }
}