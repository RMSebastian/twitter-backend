import { CreatePostInputDTO, PostDTO } from '../dto'
import { PostRepository } from '../repository'
import { PostService } from '.'
import { validate } from 'class-validator'
import { ForbiddenException, NotFoundException } from '@utils'
import { CursorPagination } from '@types'
import { UserRepository } from '@domains/user/repository'
import { FollowerRepository } from '@domains/follower/repository'

export class PostServiceImpl implements PostService {
  constructor (
    private readonly postRepository: PostRepository,
    private readonly followRepository: FollowerRepository,
    private readonly userRepository: UserRepository) {}

  async createPost (userId: string, data: CreatePostInputDTO): Promise<PostDTO> {
    await validate(data)
    return await this.postRepository.create(userId, data)
  }

  async deletePost (userId: string, postId: string): Promise<void> {
    const post = await this.postRepository.getById(postId)
    if (!post) throw new NotFoundException('post')
    if (post.authorId !== userId) throw new ForbiddenException()
    await this.postRepository.delete(postId)
  }

  async getPost (userId: string, postId: string): Promise<PostDTO> {
    const post = await this.postRepository.getById(postId)
    if (!post) throw new NotFoundException('post')
    const user = await this.userRepository.getById(post.authorId);
    if(!user) throw new NotFoundException("user");
    if(user.isPrivate){
      const follow = await this.followRepository.getFollowId(userId,post.authorId);
      if(!follow) throw new NotFoundException("follow");
    }
    return post
  }

  async getLatestPosts (userId: string, options: CursorPagination): Promise<PostDTO[]> {
    //DEV TODO: tengo la duda de que si llegan a ser duplicado los valores esto tenga que verificarse
    const usersFilter = await this.followRepository.getFollowedIds(userId);
    return await this.postRepository.getAllByDatePaginated(usersFilter ,options)
  }

  async getPostsByAuthor (userId: any, authorId: string): Promise<PostDTO[]> {
    const user = await this.userRepository.getById(authorId);
    if(!user) throw new NotFoundException("user");
    if(user.isPrivate){
      const follow = await this.followRepository.getFollowId(userId,authorId);
      if(!follow) throw new NotFoundException("follow");
    }
    return await this.postRepository.getByAuthorId(authorId)
  }
}
