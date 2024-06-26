import { CreatePostInputDTO, ExtendedPostDTO, PostDTO } from "@domains/post/dto";
import { CursorPagination } from "@types";
import { CommentService } from ".";
import { FollowerRepository } from "@domains/follower/repository";
import { UserRepository } from "@domains/user/repository";
import { CommentRepository } from "../repository";
import { ForbiddenException, NotFoundException } from "@utils";
import { ReactionRepository } from "@domains/reaction";
import { ReactionType } from "@prisma/client";
import { S3Service } from "@aws/service";

export class CommentServiceImpl implements CommentService{
    constructor (
        private readonly commentRepository: CommentRepository,
        private readonly followRepository: FollowerRepository,
        private readonly userRepository: UserRepository,
        private readonly reactionRepository: ReactionRepository,
        private readonly s3Client: S3Service
      ) {}
    
    async createComment(userId: string, data: CreatePostInputDTO, postId: string | null): Promise<PostDTO> {
        if(data.images)data.images = data.images.map((image, index) => `comment/${userId}/${index}/${Date.now()}/${image}`)
        const comment = await this.commentRepository.create(userId, data,postId);
        const commentWithUrl = await this.putUrl(comment);
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
        return await this.ExtendPosts(commentsWithUrl); 
    }
    async getCommentsByPostId(postId: string, options: CursorPagination): Promise<PostDTO[]> {
        const comments = await this.commentRepository.getAllByPostId(postId,options);
        const commentsWithUrl = await this.getUrlsArray(comments);
        return await this.ExtendPosts(commentsWithUrl); 
    }
    public async putUrl(comment: PostDTO): Promise<PostDTO>{
      if(comment.images.length != 0){
        const promises = comment.images.map(image => this.s3Client.PutObjectFromS3(image));
        comment.images = await Promise.all(promises);
      }
      return comment;
    }
    public async getUrl(comment: PostDTO): Promise<PostDTO>{
      if(comment.images.length != 0){
        const promises = comment.images.map(image => this.s3Client.GetObjectFromS3(image));
        comment.images = await Promise.all(promises);
      }
        return comment;
    }
    public async getUrlsArray(comments: PostDTO[]): Promise<PostDTO[]>{
      for (const comment of comments) { 
        if(comment.images.length != 0){
          const promises = comment.images.map(image => this.s3Client.GetObjectFromS3(image));
          comment.images = await Promise.all(promises);
        }
      }
      return comments;
    }
    public async ExtendPosts(comments: PostDTO[]):Promise<ExtendedPostDTO[]>{
      const extendedPosts = await Promise.all(comments.map(async (comment) =>{
        const author = await this.userRepository.getById(comment.authorId);
        if(author == null) throw new NotFoundException(`AUTHOR_NOT_EXITS_ID:${comment.authorId}`);
        if(author.image != null){
          const url = await this.s3Client.GetObjectFromS3(author.image);
          if(!url)throw new NotFoundException('url')
            author.image = url;
        }
        const qtyComments = await  this.commentRepository.getCountByPostId(comment.id);
        const qtyLikes = await this.reactionRepository.getCountByPostId(comment.id,ReactionType.Like);
        const qtyRetweets = await this.reactionRepository.getCountByPostId(comment.id,ReactionType.Retweet);

        return new ExtendedPostDTO({
          id: comment.id,
          authorId: comment.authorId,
          content: comment.content,
          images: comment.images,
          createdAt: comment.createdAt,
          author: author,
          qtyComments:qtyComments,
          qtyLikes:qtyLikes,
          qtyRetweets:qtyRetweets,
        });
      }));return extendedPosts;
    }

}