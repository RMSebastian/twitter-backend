import { CreatePostInputDTO, ExtendedPostDTO, PostDTO } from "@domains/post/dto";
import { CursorPagination } from "@types";
import { CommentService } from ".";
import { CommentRepository } from "../repository";
import { ForbiddenException, NotFoundException } from "@utils";
import { S3Service } from "@aws/service";

export class CommentServiceImpl implements CommentService{
    constructor (
        private readonly commentRepository: CommentRepository,
        private readonly s3Client: S3Service
      ) {}
    
    async createComment(userId: string, data: CreatePostInputDTO): Promise<ExtendedPostDTO> {
        if(data.images)data.images = data.images.map((image, index) => `comment/${userId}/${index}/${Date.now()}/${image}`)
        const comment = await this.commentRepository.create(userId, data);
        const commentWithUrl = await this.putUrl(comment);
        return commentWithUrl
    }
    async deleteComment (userId: string, postId: string): Promise<void>  {
        const comment = await this.commentRepository.getById(postId)
        if (!comment) throw new NotFoundException('post')
        if (comment.authorId !== userId) throw new ForbiddenException()
        await this.commentRepository.delete(postId)
    }
    async getComment (postId: string): Promise<ExtendedPostDTO> {
    
      const post = await this.commentRepository.getById(postId)
      if (!post) throw new NotFoundException('post');
      const postWithUrl = await this.getUrl(post);
      return postWithUrl;
    }
  
    async getLatestComments(userId: string, options: CursorPagination): Promise<ExtendedPostDTO[]> {
        const comments = await this.commentRepository.getAllById(userId ,options)
        if(comments){
          const commentsWithUrl = await this.getUrlsArray(comments);
          return commentsWithUrl
        }else{
          return[]
        }
        
    }
    async getCommentsByPostId(postId: string, options: CursorPagination): Promise<ExtendedPostDTO[]> {
        const comments = await this.commentRepository.getAllByPostId(postId,options);
        if(comments){
          const commentsWithUrl = await this.getUrlsArray(comments);
          return commentsWithUrl
        }else{
          return[]
        }
    }
    public async putUrl(comment: ExtendedPostDTO): Promise<ExtendedPostDTO>{
      if(comment.images.length != 0){
        const promises = comment.images.map(image => this.s3Client.PutObjectFromS3(image));
        comment.images = await Promise.all(promises);
      }
      return comment
    }
    public async getUrl(comment: ExtendedPostDTO): Promise<ExtendedPostDTO>{
      if(comment.images.length != 0){
        const promises = comment.images.map(image => this.s3Client.GetObjectFromS3(image));
        comment.images = await Promise.all(promises);
      }
        return comment
    }
    public async getUrlsArray(comments: ExtendedPostDTO[]): Promise<ExtendedPostDTO[]>{
      for (const comment of comments) { 
        if(comment.images.length != 0){
          const promises = comment.images.map(image => this.s3Client.GetObjectFromS3(image));
          comment.images = await Promise.all(promises);
        }
      }
      return comments
    }

}