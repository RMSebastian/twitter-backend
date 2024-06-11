import { PrismaClient } from '@prisma/client'

import { CursorPagination } from '@types'

import { PostRepository } from '.'
import { CreatePostInputDTO, PostDTO } from '../dto'
import { GetObjectFromS3 } from '@utils/s3.aws'

export class PostRepositoryImpl implements PostRepository {
  constructor (private readonly db: PrismaClient) {}


  async create (userId: string, data: CreatePostInputDTO): Promise<PostDTO> {
    const post = await this.db.post.create({
      data: {
        authorId: userId,
        ...data
      }
    })

    //Check later for improvements
    if(post.images.length != 0){
      await post.images.map((p)=> GetObjectFromS3(p));
    }
    
    return new PostDTO(post)
  }

  async getAllByDatePaginated (filter: string[],options: CursorPagination): Promise<PostDTO[]> {
    const posts = await this.db.post.findMany({
      where:{AND:[{parentId: null},{OR:[{author:{isPrivate: false}},{ authorId: { in: filter } }]}]},
      cursor: options.after ? { id: options.after } : (options.before) ? { id: options.before } : undefined,
      skip: options.after ?? options.before ? 1 : undefined,
      take: options.limit ? (options.before ? -options.limit : options.limit) : undefined,
      orderBy: [
        {
          createdAt: 'desc'
        },
        {
          id: 'asc'
        }
      ]
    })
    const postDTO = posts.map(post => new PostDTO(post));

    await postDTO.forEach(post =>{if(post.images.length != 0)post.images.map(GetObjectFromS3);} )
    
    return postDTO;
  }

  async delete (postId: string): Promise<void> {
    await this.db.post.delete({
      where: {
        id: postId
      }
    })
  }

  async getById (postId: string): Promise<PostDTO | null> {
    const post = await this.db.post.findUnique({
      where: {
        id: postId
      }
    })

    if(post != null && post.images.length != 0){
      await post.images.map((p)=> GetObjectFromS3(p));
    }

    return (post != null) ? new PostDTO(post) : null
  }

  async getByAuthorId (authorId: string): Promise<PostDTO[]> {
    const posts = await this.db.post.findMany({
      where: {
        authorId
      }
    })
    const postDTO = posts.map(post => new PostDTO(post));

    await postDTO.forEach(post =>{if(post.images.length != 0)post.images.map(GetObjectFromS3);} )
    
    return postDTO;
  }
}
