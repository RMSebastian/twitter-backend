import { CreatePostInputDTO, PostDTO } from "@domains/post/dto";
import { CursorPagination } from "@types";
import { CommentRepository } from ".";
import { PrismaClient } from "@prisma/client";

export class CommentRepositoryImpl implements CommentRepository{
    constructor(private readonly db: PrismaClient){}

    async create(userId: string, data: CreatePostInputDTO): Promise<PostDTO> {
      const post = await this.db.post.create({
          data: {
            authorId: userId,
            ...(data.parentId !== null && { parentId: data.parentId }),
            ...data
          }
        }
      );
      
      return new PostDTO(post)
    }
    async delete(postId: string): Promise<void> {
      await this.db.post.delete({
          where: {
            id: postId
          }
        }
      );
    }
    async getById(postId: string): Promise<PostDTO | null> {
      const comment = await this.db.post.findUnique({
          where: {
            id: postId
          }
        }
      );
      
      return (comment != null) ? new PostDTO(comment) : null
    }
    async getAllById(userId: string, options: CursorPagination): Promise<PostDTO[]> {
        const comments = await this.db.post.findMany({
            where:{AND:[{authorId: userId},{parentId:{not: null}}]},
            cursor: options.after ? { id: options.after } : (options.before) ? { id: options.before } : undefined,
            skip: options.after ?? options.before ? 1 : undefined,
            take: options.limit ? (options.before ? -options.limit : options.limit) : undefined,
            orderBy: [
              {
                createdAt: 'desc'
              }
            ]
          }
        );
        return comments.map(comment => new PostDTO(comment));
    }
    
    async getAllByPostId(postId: string, options: CursorPagination): Promise<PostDTO[]> {
      const comments = await this.db.post.findMany({
        where:{parentId: postId},
        cursor: options.after ? { id: options.after } : (options.before) ? { id: options.before } : undefined,
        skip: options.after ?? options.before ? 1 : undefined,
        take: options.limit ? (options.before ? -options.limit : options.limit) : undefined,
        orderBy: [
          {
            reaction: {              
              _count: 'desc'
            }
          },
          {
            createdAt: 'desc'
          }
        ]
      }
    );
      return comments.map(comment => new PostDTO(comment));
    }
    async getCountByPostId(postId: string): Promise<number>{
      const count = await this.db.post.count({
        where:{
          parentId: postId
        }
      })

      return count;
    }
    
    
}