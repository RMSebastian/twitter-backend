import { ReactionType } from "@prisma/client";
import { ReactionDTO } from "../dto";

export interface ReactionRepository{
    create(userId: string,postId: string): Promise<ReactionDTO>
    delete(userId: string,postId: string): Promise<void>
    getByUserId(userId: string, filter: null | ReactionType): Promise<ReactionDTO[]>
}