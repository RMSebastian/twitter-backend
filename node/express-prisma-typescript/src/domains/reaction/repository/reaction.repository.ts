import { ReactionType } from "@prisma/client";
import { CreateReactionInputDTO, ReactionDTO } from "../dto";

export interface ReactionRepository{
    create(userId: string,postId: string, data: CreateReactionInputDTO): Promise<ReactionDTO>
    delete(reactionId: string): Promise<void>
    getReactionId(userId: string,postId: string, data: CreateReactionInputDTO): Promise<ReactionDTO | null>
    getAllByUserId(userId: string, filter: null | ReactionType): Promise<ReactionDTO[]>
}