import { CreatePostInputDTO, PostDTO } from "@domains/post/dto";
import { CursorPagination } from "@types";
import { CommentService } from ".";
import { FollowerRepository } from "@domains/follower/repository";
import { UserRepository } from "@domains/user/repository";
import { validate } from "class-validator";
import { CommentRepository } from "../repository";
import { ForbiddenException, NotFoundException } from "@utils";
import { GetObjectFromS3 } from "@utils/s3.aws";

export class CommentServiceImpl implements CommentService{
    constructor (
        private readonly commentRepository: CommentRepository,
        private readonly followRepository: FollowerRepository,
        private readonly userRepository: UserRepository) {}
    
    async createComment(userId: string, data: CreatePostInputDTO, postId: string | null): Promise<PostDTO> {
        await validate(data)
        if(data.images){
          for (let index = 0; index < data.images.length; index++) {
            data.images[index] = `comment-${userId}-${index}-${data.images[index]}`;
          }
        }
        const comment = await this.commentRepository.create(userId, data,postId);
        const commentWithUrl = await this.getUrl(comment);
        return commentWithUrl;
    }
    async deleteComment (userId: string, postId: string): Promise<void>  {
        const comment = await this.commentRepository.getById(postId)
        if (!comment) throw new NotFoundException('post')
        if (comment.authorId !== userId) throw new ForbiddenException()
        await this.commentRepository.delete(postId)
    }
    async getLatestComments(userId: string, options: CursorPagination): Promise<PostDTO[]> {
        const comments = await this.commentRepository.getAllById(userId ,options)
        const commentsWithUrl = await this.getUrlsArray(comments);
        return commentsWithUrl; 
    }
    async getCommentsByPostId(postId: string): Promise<PostDTO[]> {
        const comments = await this.commentRepository.getAllByPostId(postId);
        const commentsWithUrl = await this.getUrlsArray(comments);
        return commentsWithUrl;
    }
    private async getUrl(post: PostDTO): Promise<PostDTO>{
        if(post.images.length != 0){
          for(let image of post.images) image = await GetObjectFromS3(image)
        }
        return post;
      }
      private async getUrlsArray(comments: PostDTO[]): Promise<PostDTO[]>{
        for (const comment of comments) { 
          for (let image of comment.images) {
            if (image != " ") {
              const url = await GetObjectFromS3(image);
              if (!url) throw new NotFoundException('url');
              image = url;
            }
          }
        }
        return comments;
      }

}