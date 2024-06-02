import { PrismaClient, ReactionType } from "@prisma/client";
import { ReactionRepository } from ".";
import { ReactionDTO } from "../dto";

export class ReactionRepositoryImpl implements ReactionRepository{
    constructor(private readonly db: PrismaClient){}
    async create(userId: string, postId: string): Promise<ReactionDTO> {
        throw new Error("Method not implemented.");
    }
    async delete(userId: string, postId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    async getByUserId(userId: string, filter: ReactionType | null): Promise<ReactionDTO[]> {
        throw new Error("Method not implemented.");
    }


}