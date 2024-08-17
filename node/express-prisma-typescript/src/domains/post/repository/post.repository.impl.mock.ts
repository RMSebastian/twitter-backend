import { CursorPagination } from '@types';
import { ExtendedPostDTO } from '../dto';
import { PostRepository } from './post.repository';

export class PostRepositoryImplMock implements PostRepository {
  getFollowPostsPaginated = jest.fn();
  create = jest.fn();
  delete = jest.fn();
  getById = jest.fn();
  getCountByPostId = jest.fn();
  getAllByDatePaginated = jest.fn();
  getByAuthorId = jest.fn();
  getCountByUserId = jest.fn();
}
