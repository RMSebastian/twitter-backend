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
    if(data.images)data.images = data.images.map((image, index) => `post/${userId}/${index}/${Date.now()}/${image}`);
    const post = await this.postRepository.create(userId, data);

    const postWithUrl = await this.putUrl(post);
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
      const promises = post.images.map(image => PutObjectFromS3(image));
      post.images = await Promise.all(promises);
    }
    return post;
  }
  private async getUrl(post: PostDTO): Promise<PostDTO>{
    if(post.images.length != 0){
      const promises = post.images.map(image => GetObjectFromS3(image));
      post.images = await Promise.all(promises);
    }
    return post;
  }
  private async getUrlsArray(posts: PostDTO[]): Promise<PostDTO[]>{
    for (const post of posts) { 
      if(post.images.length != 0){
        const promises = post.images.map(image => GetObjectFromS3(image));
        post.images = await Promise.all(promises);
      }
    }
    return posts;
  }
}
