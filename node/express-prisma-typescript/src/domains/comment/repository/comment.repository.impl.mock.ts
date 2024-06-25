import { CommentRepository } from "./comment.repository";

export class CommentRepositoryImplMock implements CommentRepository{
    create = jest.fn();
    delete = jest.fn();
    getById = jest.fn();
    getAllById = jest.fn();
    getAllByPostId = jest.fn();
    getCountByPostId = jest.fn();
}