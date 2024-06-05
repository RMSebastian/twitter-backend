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
    return await this.postRepository.create(userId, data, null)
  }
  async createComment(userId: string, postId: string, data: CreatePostInputDTO): Promise<PostDTO>{
    await validate(data)
    return await this.postRepository.create(userId, data, postId)
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
    const userPrivacy = await this.userRepository.getPrivacyById(post.authorId);
    if (userPrivacy == null) throw new NotFoundException('user')
    if(userPrivacy){
      const follow = await this.followRepository.getFollowId(userId,post.authorId);
      if(!follow) throw new NotFoundException("follow");
    }
    return post
  }

  async getLatestPosts (userId: string, options: CursorPagination): Promise<PostDTO[]> {
    const usersFilter = await this.followRepository.getFollowedIds(userId);
    return await this.postRepository.getAllByDatePaginated(usersFilter ,options)
  }

  async getPostsByAuthor (userId: any, authorId: string): Promise<PostDTO[]> {
    const userPrivacy = await this.userRepository.getPrivacyById(authorId);
    if (userPrivacy == null) throw new NotFoundException('user')
    if(userPrivacy){
      const follow = await this.followRepository.getFollowId(userId,authorId);
      if(!follow) throw new NotFoundException("follow");
    }
    return await this.postRepository.getByAuthorId(authorId)
  }
}
