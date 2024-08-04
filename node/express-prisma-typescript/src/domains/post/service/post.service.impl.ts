import { CreatePostInputDTO, ExtendedPostDTO, PostDTO } from '../dto'
import { PostRepository } from '../repository'
import { PostService } from '.'
import { ForbiddenException, NotFoundException } from '@utils'
import { CursorPagination } from '@types'
import { UserRepository } from '@domains/user/repository'
import { FollowerRepository } from '@domains/follower/repository'
import { S3Service } from '@aws/service'


export class PostServiceImpl implements PostService {
  constructor (
    private readonly postRepository: PostRepository,
    private readonly followRepository: FollowerRepository,
    private readonly userRepository: UserRepository,
    private readonly s3Client: S3Service
  ) {}

  async createPost (userId: string, data: CreatePostInputDTO): Promise<ExtendedPostDTO> {
    if(data.images)data.images = data.images.map((image, index) => `post/${userId}/${index}/${Date.now()}/${image}`);
    const post = await this.postRepository.create(userId, data);
    const postWithUrl = await this.putUrl(post);
    return postWithUrl
  }

  async deletePost (userId: string, postId: string): Promise<void> {
    const post = await this.postRepository.getById(postId)
    if (!post) throw new NotFoundException('post')
    if (post.authorId !== userId) throw new ForbiddenException()
    await this.postRepository.delete(postId)
  }

  async getPost (userId: string, postId: string): Promise<ExtendedPostDTO> {
    
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

  async getLatestPosts (userId: string, options: CursorPagination): Promise<ExtendedPostDTO[]> {
    const usersFilter = await this.followRepository.getFollowedIds(userId);
    if(!userId)throw new NotFoundException("user");
    const posts = await this.postRepository.getAllByDatePaginated(usersFilter ,options);
    if(posts){
      const postWithUrl = await this.getUrlsArray(posts);
      return postWithUrl
    }else{
      return[]
    }
    
  }

  async getPostsByAuthor (userId: any, authorId: string): Promise<ExtendedPostDTO[]> {    
    if(userId == authorId)
    {
      const posts = await this.postRepository.getByAuthorId(authorId)
      if(posts){
        const postWithUrl = await this.getUrlsArray(posts);
        return postWithUrl
      }else{
        return[]
      }
      
    }
    const userPrivacy = await this.userRepository.getPrivacyById(authorId);
    if (userPrivacy == null) {
      throw new NotFoundException('user')
    }
    if(userPrivacy){
      const follow = await this.followRepository.getFollowId(userId,authorId);
      if(!follow) throw new NotFoundException("follow");
    }
    const posts = await this.postRepository.getByAuthorId(authorId)

    const postWithUrl = await this.getUrlsArray(posts);
    
    return postWithUrl;
  }
  public async putUrl(post: ExtendedPostDTO): Promise<ExtendedPostDTO>{
    if(post.images.length != 0){
      const promises = post.images.map(image => this.s3Client.PutObjectFromS3(image));
      post.images = await Promise.all(promises);
    }
    return post
  }
  public async getUrl(post: ExtendedPostDTO): Promise<ExtendedPostDTO>{
    if(post.images.length != 0){
      const promises = post.images.map(image => {
        return this.s3Client.GetObjectFromS3(image)
      });
      post.images = await Promise.all(promises);
    }
    return await post
  }
  public async getUrlsArray(posts: ExtendedPostDTO[]): Promise<ExtendedPostDTO[]>{
    for (const post of posts) { 
      if(post.images.length != 0){
        const promises = post.images.map(image => this.s3Client.GetObjectFromS3(image));
        post.images = await Promise.all(promises);
      }
    }
    return posts
  }
}
