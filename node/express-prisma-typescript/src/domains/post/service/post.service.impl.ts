import { CreatePostInputDTO, PostDTO } from '../dto'
import { PostRepository } from '../repository'
import { PostService } from '.'
import { validate } from 'class-validator'
import { ForbiddenException, NotFoundException } from '@utils'
import { CursorPagination } from '@types'
import { UserRepository } from '@domains/user/repository'
import { FollowerRepository } from '@domains/follower/repository'
import { GetObjectFromS3, PutObjectFromS3 } from '@utils/s3.aws'

export class PostServiceImpl implements PostService {
  constructor (
    private readonly postRepository: PostRepository,
    private readonly followRepository: FollowerRepository,
    private readonly userRepository: UserRepository) {}

  async createPost (userId: string, data: CreatePostInputDTO): Promise<PostDTO> {
    await validate(data)
    if(data.images){
      for (let index = 0; index < data.images.length; index++) {
        data.images[index] = `post-${userId}-${index}-${data.images[index]}`;
      }
    }
    const post = await this.postRepository.create(userId, data);

    const postWithUrl = await this.getUrl(post);
    return postWithUrl;
  }
  async deletePost (userId: string, postId: string): Promise<void> {
    const post = await this.postRepository.getById(postId)
    if (!post) throw new NotFoundException('post')
    if (post.authorId !== userId) throw new ForbiddenException()
    await this.postRepository.delete(postId)
  }

  async getPost (userId: string, postId: string): Promise<PostDTO> {
    
    const post = await this.postRepository.getById(postId)
    if (!post) throw new NotFoundException('post');
    const userPrivacy = await this.userRepository.getPrivacyById(post.authorId);
    if (userPrivacy == null) throw new NotFoundException('user')
    if(userPrivacy){
      const follow = await this.followRepository.getFollowId(userId,post.authorId);
      if(!follow) throw new NotFoundException("follow");
    }
    const postWithUrl = await this.getUrl(post);
    return postWithUrl;
  }

  async getLatestPosts (userId: string, options: CursorPagination): Promise<PostDTO[]> {
    const usersFilter = await this.followRepository.getFollowedIds(userId);
    const posts = await this.postRepository.getAllByDatePaginated(usersFilter ,options);
    const postWithUrl = await this.getUrlsArray(posts);
    return postWithUrl;
  }

  async getPostsByAuthor (userId: any, authorId: string): Promise<PostDTO[]> {    
    const userPrivacy = await this.userRepository.getPrivacyById(authorId);
    if (userPrivacy == null) throw new NotFoundException('user')
    if(userPrivacy){
      const follow = await this.followRepository.getFollowId(userId,authorId);
      if(!follow) throw new NotFoundException("follow");
    }
    const posts = await this.postRepository.getByAuthorId(authorId)
    const postWithUrl = await this.getUrlsArray(posts);
    return postWithUrl;
  }
  private async putUrl(post: PostDTO): Promise<PostDTO>{
    if(post.images.length != 0){
      for(let image of post.images) image = await PutObjectFromS3(image)
    }
    return post;
  }
  private async getUrl(post: PostDTO): Promise<PostDTO>{
    if(post.images.length != 0){
      for(let image of post.images) image = await GetObjectFromS3(image)
    }
    return post;
  }
  private async getUrlsArray(posts: PostDTO[]): Promise<PostDTO[]>{
    for (const post of posts) { 
      for (let image of post.images) {
        if (image != " ") {
          const url = await GetObjectFromS3(image);
          if (!url) throw new NotFoundException('url');
          image = url;
        }
      }
    }
    return posts;
  }
}
