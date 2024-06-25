
import { PostRepository } from "./post.repository";

export class PostRepositoryImplMock implements PostRepository{
    create = jest.fn();
    delete = jest.fn();
    getById = jest.fn();
    getCountByPostId = jest.fn();
    getAllByDatePaginated = jest.fn();
    getByAuthorId = jest.fn();
    getCountByUserId = jest.fn();
}