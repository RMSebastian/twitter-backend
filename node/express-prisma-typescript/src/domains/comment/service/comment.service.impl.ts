import { CreatePostInputDTO, PostDTO } from "@domains/post/dto";
import { CursorPagination } from "@types";
import { CommentService } from ".";
import { FollowerRepository } from "@domains/follower/repository";
import { UserRepository } from "@domains/user/repository";
import { validate } from "class-validator";
import { CommentRepository } from "../repository";
import { ForbiddenException, NotFoundException } from "@utils";

export class CommentServiceImpl implements CommentService{
    constructor (
        private readonly commentRepository: CommentRepository,
        private readonly followRepository: FollowerRepository,
        private readonly userRepository: UserRepository) {}
    
    async createComment(userId: string, data: CreatePostInputDTO, postId: string | null): Promise<PostDTO> {
        await validate(data)
        return await this.commentRepository.create(userId, data,postId);
    }
    async deleteComment (userId: string, postId: string): Promise<void>  {
        const comment = await this.commentRepository.getById(postId)
        if (!comment) throw new NotFoundException('post')
        if (comment.authorId !== userId) throw new ForbiddenException()
        await this.commentRepository.delete(postId)
    }
    async getLatestComments(userId: string, options: CursorPagination): Promise<PostDTO[]> {
        return await this.commentRepository.getAllById(userId ,options)
    }
    async getCommentsByPostId(postId: string): Promise<PostDTO[]> {
        return await this.commentRepository.getAllByPostId(postId)
    }

}