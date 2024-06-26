import { CreatePostInputDTO, ExtendedPostDTO, PostDTO } from '../dto'
import { PostRepository } from '../repository'
import { PostService } from '.'
import { validate } from 'class-validator'
import { ForbiddenException, NotFoundException } from '@utils'
import { CursorPagination } from '@types'
import { UserRepository } from '@domains/user/repository'
import { FollowerRepository } from '@domains/follower/repository'
import { ReactionRepository } from '@domains/reaction'
import { ReactionType } from '@prisma/client'
import { S3Service } from '@aws/service'

export class PostServiceImpl implements PostService {
  constructor (
    private readonly postRepository: PostRepository,
    private readonly followRepository: FollowerRepository,
    private readonly userRepository: UserRepository,
    private readonly reactionRepository: ReactionRepository,
    private readonly s3Client: S3Service
  ) {}

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

  async getLatestPosts (userId: string, options: CursorPagination): Promise<ExtendedPostDTO[]> {
    const usersFilter = await this.followRepository.getFollowedIds(userId);
    const posts = await this.postRepository.getAllByDatePaginated(usersFilter ,options);
    const postWithUrl = await this.getUrlsArray(posts);
    return await this.ExtendPosts(postWithUrl);
  }

  async getPostsByAuthor (userId: any, authorId: string): Promise<ExtendedPostDTO[]> {    
    const userPrivacy = await this.userRepository.getPrivacyById(authorId);
    if (userPrivacy == null) throw new NotFoundException('user')
    if(userPrivacy){
      const follow = await this.followRepository.getFollowId(userId,authorId);
      if(!follow) throw new NotFoundException("follow");
    }
    const posts = await this.postRepository.getByAuthorId(authorId)
    const postWithUrl = await this.getUrlsArray(posts);
    return await this.ExtendPosts(postWithUrl)
  }
  private async putUrl(post: PostDTO): Promise<PostDTO>{
    if(post.images.length != 0){
      const promises = post.images.map(image => this.s3Client.PutObjectFromS3(image));
      post.images = await Promise.all(promises);
    }
    return post;
  }
  private async getUrl(post: PostDTO): Promise<PostDTO>{
    if(post.images.length != 0){
      const promises = post.images.map(image => this.s3Client.GetObjectFromS3(image));
      post.images = await Promise.all(promises);
    }
    return post;
  }
  private async getUrlsArray(posts: PostDTO[]): Promise<PostDTO[]>{
    for (const post of posts) { 
      if(post.images.length != 0){
        const promises = post.images.map(image => this.s3Client.GetObjectFromS3(image));
        post.images = await Promise.all(promises);
      }
    }
    return posts;
  }
  private async ExtendPosts(posts: PostDTO[]):Promise<ExtendedPostDTO[]>{
    const extendedPosts = await Promise.all(posts.map(async (post) =>{
      const author = await this.userRepository.getById(post.authorId);
      if(author == null) throw new NotFoundException(`AUTHOR_NOT_EXITS_ID:${post.authorId}`);
      if(author.image != null){
        const url = await this.s3Client.GetObjectFromS3(author.image);
        if(!url)throw new NotFoundException('url')
          author.image = url;
      }
      const qtyComments = await  this.postRepository.getCountByPostId(post.id);
      const qtyLikes = await this.reactionRepository.getCountByPostId(post.id,ReactionType.Like);
      const qtyRetweets = await this.reactionRepository.getCountByPostId(post.id,ReactionType.Retweet);

      return new ExtendedPostDTO({
        id: post.id,
        authorId: post.authorId,
        content: post.content,
        images: post.images,
        createdAt: post.createdAt,
        author: author,
        qtyComments:qtyComments,
        qtyLikes:qtyLikes,
        qtyRetweets:qtyRetweets,
      });
    }));

    return extendedPosts;
  }
}
