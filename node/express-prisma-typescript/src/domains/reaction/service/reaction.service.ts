import { ReactionType } from "@prisma/client";
import { CreateReactionInputDTO, ReactionDTO} from "../dto";

export interface ReactionService{
    createReaction(userId: string,postId: string, data: CreateReactionInputDTO): Promise<ReactionDTO>
    deleteReaction(userId: string,postId: string, data: CreateReactionInputDTO): Promise<void>;
    getReactionsWithFilter(userId: string, filter: null | ReactionType): Promise<ReactionDTO[]>
}