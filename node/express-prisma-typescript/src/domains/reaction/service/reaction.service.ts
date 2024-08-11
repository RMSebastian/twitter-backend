import { ReactionType } from "@prisma/client";
import { CreateReactionInputDTO, ReactionDTO} from "../dto";

export interface ReactionService{
    createReaction(userId: string,postId: string, data: CreateReactionInputDTO): Promise<ReactionDTO>
    deleteReaction(reactionId: string): Promise<void>;
    getReactionsWithFilter(userId: string, filter: null | ReactionType): Promise<ReactionDTO[]>
}