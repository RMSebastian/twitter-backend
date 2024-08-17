import { Post, PrismaClient } from '@prisma/client';

import { CursorPagination } from '@types';

import { PostRepository } from '.';
import { CreatePostInputDTO, ExtendedPostDTO, PostDTO } from '../dto';
import { UserViewDTO } from '@domains/user/dto';
import { ReactionDTO } from '@domains/reaction/dto';

export class PostRepositoryImpl implements PostRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(userId: string, data: CreatePostInputDTO): Promise<ExtendedPostDTO> {
    const post = await this.db.post.create({
      data: {
        authorId: userId,
        ...data,
      },
      include: {
        reaction: true,
        author: true,
        comment: {
          include: {
            author: true,
            reaction: true,
            comment: {
              include: {
                author: true,
              },
            },
          },
        },
      },
    });
    const dto = new PostDTO(post);

    const extendedPost = new ExtendedPostDTO({
      ...dto,
      author: new UserViewDTO(post.author),
      comments: 0,
      reactions: post.reaction.map((reaction) => new ReactionDTO(reaction)),
    });

    return extendedPost;
  }

  async getAllByDatePaginated(userId: string, filter: string[], options: CursorPagination): Promise<ExtendedPostDTO[]> {
    const posts = await this.db.post.findMany({
      where: {
        AND: [
          { parentId: null },
          { OR: [{ author: { isPrivate: false } }, { authorId: { in: filter } }, { authorId: userId }] },
        ],
      },
      cursor: options.after ? { id: options.after } : options.before ? { id: options.before } : undefined,
      skip: options.after ?? options.before ? 1 : undefined,
      take: options.limit ? (options.before ? -options.limit : options.limit) : undefined,
      orderBy: [
        {
          createdAt: 'desc',
        },
        {
          id: 'asc',
        },
      ],
      include: {
        reaction: true,
        author: true,
        comment: {
          include: {
            author: true,
            reaction: true,
            comment: true,
          },
        },
      },
    });
    return posts.map((post) => {
      const dto = new PostDTO(post);

      const extendedPost = new ExtendedPostDTO({
        ...dto,
        author: new UserViewDTO(post.author),
        comments: post.comment.length,
        reactions: post.reaction.map((reaction) => new ReactionDTO(reaction)),
      });

      return extendedPost;
    });
  }
  async getFollowPostsPaginated(
    userId: string,
    filter: string[],
    options: CursorPagination
  ): Promise<ExtendedPostDTO[]> {
    const posts = await this.db.post.findMany({
      where: { AND: [{ parentId: null }, { authorId: { in: filter, not: userId } }] },
      cursor: options.after ? { id: options.after } : options.before ? { id: options.before } : undefined,
      skip: options.after ?? options.before ? 1 : undefined,
      take: options.limit ? (options.before ? -options.limit : options.limit) : undefined,
      orderBy: [
        {
          createdAt: 'desc',
        },
        {
          id: 'asc',
        },
      ],
      include: {
        reaction: true,
        author: true,
        comment: {
          include: {
            author: true,
            reaction: true,
            comment: true,
          },
        },
      },
    });
    return posts.map((post) => {
      const dto = new PostDTO(post);

      const extendedPost = new ExtendedPostDTO({
        ...dto,
        author: new UserViewDTO(post.author),
        comments: post.comment.length,
        reactions: post.reaction.map((reaction) => new ReactionDTO(reaction)),
      });

      return extendedPost;
    });
  }

  async delete(postId: string): Promise<void> {
    await this.db.post.delete({
      where: {
        id: postId,
      },
    });
  }

  async getById(postId: string): Promise<ExtendedPostDTO | null> {
    const post = await this.db.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        reaction: true,
        author: true,
        comment: {
          include: {
            author: true,
            reaction: true,
            comment: true,
          },
        },
      },
    });
    if (post != null) {
      const postDto = new PostDTO(post);

      const extendedPost = new ExtendedPostDTO({
        ...postDto,
        author: new UserViewDTO(post.author),
        comments: post.comment.length,
        reactions: post.reaction.map((reaction) => new ReactionDTO(reaction)),
      });

      return extendedPost;
    } else {
      return null;
    }
  }

  async getByAuthorId(authorId: string): Promise<ExtendedPostDTO[]> {
    const posts = await this.db.post.findMany({
      where: {
        authorId: authorId,
        parentId: null,
        author: {
          isPrivate: false,
        },
      },
      include: {
        reaction: true,
        author: true,
        comment: {
          include: {
            author: true,
            reaction: true,
            comment: true,
          },
        },
      },
    });
    return posts.map((post) => {
      const dto = new PostDTO(post);

      const extendedPost = new ExtendedPostDTO({
        ...dto,
        author: new UserViewDTO(post.author),
        comments: post.comment.length,
        reactions: post.reaction.map((reaction) => new ReactionDTO(reaction)),
      });

      return extendedPost;
    });
  }
}
