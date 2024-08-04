import { CreatePostInputDTO, ExtendedPostDTO, PostDTO } from "@domains/post/dto";
import { CursorPagination } from "@types";
import { CommentRepository } from ".";
import { PrismaClient } from "@prisma/client";
import { UserViewDTO } from "@domains/user/dto";
import { ReactionDTO } from "@domains/reaction/dto";

export class CommentRepositoryImpl implements CommentRepository{
    constructor(private readonly db: PrismaClient){}

    async create(userId: string, data: CreatePostInputDTO): Promise<ExtendedPostDTO> {
      const post = await this.db.post.create({
          data: {
            authorId: userId,
            ...(data.parentId !== null && { parentId: data.parentId }),
            ...data
          },
          include:{
            reaction: true,
            author:true,
            comment:{
              include:{
                author:true,
                reaction: true,
                comment:{
                  include:{
                    author: true
                  }
                }
              }
            }
    
          }
        })
        const dto = new PostDTO(post);
    
        const extendedPost = new ExtendedPostDTO({
          ...dto,
          author: new UserViewDTO(post.author),
          comments: (post.comment.length != 0)?
          post.comment.map(comment =>{
            const dto = new PostDTO(comment)
    
            return new ExtendedPostDTO({
              ...dto,
              author: new UserViewDTO(comment.author),
              comments: [],
              reactions: comment.reaction.map(reaction => new ReactionDTO(reaction))
            })
          })
          :[],
          reactions: post.reaction.map(reaction => new ReactionDTO(reaction))
          
        });
    
        return extendedPost;
      }
    async delete(postId: string): Promise<void> {
      await this.db.post.delete({
          where: {
            id: postId
          }
        }
      );
    }
    async getById(postId: string): Promise<ExtendedPostDTO | null> {
      const comment = await this.db.post.findUnique({
          where: {
            id: postId
          },
          include:{
            reaction: true,
            author:true,
            comment:{
              include:{
                author:true,
                reaction: true,
                comment: true,
              }
            }
    
          }
        })
        if (comment != null){
          const commentDto = new PostDTO(comment);
    
          const extendedPost = new ExtendedPostDTO({
            ...commentDto,
            author: new UserViewDTO(comment.author),
            comments: (comment.comment.length != 0)?
            comment.comment.map(comment =>{
              const secondCommentDto = new PostDTO(comment)
              return new ExtendedPostDTO({
                ...secondCommentDto,
                author: new UserViewDTO(comment.author),
                comments: [],
                reactions: []
              })
            })
            :[],
            reactions: comment.reaction.map(reaction => new ReactionDTO(reaction))
            
          });
      
          return extendedPost;
        }else{
          return null
        } 
      }
    async getAllById(userId: string, options: CursorPagination): Promise<ExtendedPostDTO[]> {
        const comments = await this.db.post.findMany({
            where:{AND:[{authorId: userId},{parentId:{not: null}}]},
            cursor: options.after ? { id: options.after } : (options.before) ? { id: options.before } : undefined,
            skip: options.after ?? options.before ? 1 : undefined,
            take: options.limit ? (options.before ? -options.limit : options.limit) : undefined,
            orderBy: [
              {
                createdAt: 'desc'
              }
            ],
            include:{
              reaction: true,
              author:true,
              comment:{
                include:{
                  author:true,
                  reaction: true,
                  comment:{
                    include:{
                      author: true
                    }
                  }
                }
              }
      
            }
          })
          return comments.map(comment => {
            const dto = new PostDTO(comment);
          
            const extendedPost = new ExtendedPostDTO({
              ...dto,
              author: new UserViewDTO(comment.author),
              comments: (comment.comment.length != 0)?
              comment.comment.map(comment =>{
                const dto = new PostDTO(comment)
        
                return new ExtendedPostDTO({
                  ...dto,
                  author: new UserViewDTO(comment.author),
                  comments: [],
                  reactions: comment.reaction.map(reaction => new ReactionDTO(reaction))
                })
              })
              :[],
              reactions: comment.reaction.map(reaction => new ReactionDTO(reaction))
              
            });
        
            return extendedPost;
          })
        }
    
    async getAllByPostId(postId: string, options: CursorPagination): Promise<ExtendedPostDTO[]> {
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
        ],
        include:{
          reaction: true,
          author:true,
          comment:{
            include:{
              author:true,
              reaction: true,
              comment:{
                include:{
                  author: true
                }
              }
            }
          }
  
        }
      })
      return comments.map(comment => {
        const dto = new PostDTO(comment);
      
        const extendedPost = new ExtendedPostDTO({
          ...dto,
          author: new UserViewDTO(comment.author),
          comments: (comment.comment.length != 0)?
          comment.comment.map(comment =>{
            const dto = new PostDTO(comment)
    
            return new ExtendedPostDTO({
              ...dto,
              author: new UserViewDTO(comment.author),
              comments: [],
              reactions: comment.reaction.map(reaction => new ReactionDTO(reaction))
            })
          })
          :[],
          reactions: comment.reaction.map(reaction => new ReactionDTO(reaction))
          
        });
    
        return extendedPost;
      })
    }
    
}