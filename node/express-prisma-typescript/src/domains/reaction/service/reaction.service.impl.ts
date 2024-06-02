import { ReactionType } from "@enums";
import { ReactionService } from ".";
import { CreateReactionInputDTO, ReactionDTO } from "../dto";
import { ReactionRepository } from "../repository";

export class ReactionServiceImpl implements ReactionService{
    constructor(private readonly reactionRepository: ReactionRepository){}
    
    createReaction(userId: string, postId: string, data: CreateReactionInputDTO): Promise<ReactionDTO> {
        throw new Error("Method not implemented.");
    }
    deleteReaction(userId: string, postId: string, data: CreateReactionInputDTO): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getReactionsWithFilter(userId: string, filter: ReactionType | null): Promise<ReactionDTO[]> {
        throw new Error("Method not implemented.");
    }
}