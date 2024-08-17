import { CreatePostInputDTO, ExtendedPostDTO } from '../dto';

export interface PostService {
  createPost: (userId: string, body: CreatePostInputDTO) => Promise<ExtendedPostDTO>;
  deletePost: (userId: string, postId: string) => Promise<void>;
  getPost: (userId: string, postId: string) => Promise<ExtendedPostDTO>;
  getLatestPosts: (
    userId: string,
    options: { limit?: number; before?: string; after?: string }
  ) => Promise<ExtendedPostDTO[]>;
  getFollowPosts: (
    userId: string,
    options: { limit?: number; before?: string; after?: string }
  ) => Promise<ExtendedPostDTO[]>;
  getPostsByAuthor: (userId: any, authorId: string) => Promise<ExtendedPostDTO[]>;
}
