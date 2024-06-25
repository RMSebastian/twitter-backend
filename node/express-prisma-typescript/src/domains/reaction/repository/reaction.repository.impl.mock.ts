import { ReactionRepository } from "./reaction.repository";

export class ReactionRepositoryImplMock implements ReactionRepository{
    create = jest.fn();
    delete = jest.fn();
    getReactionId = jest.fn();
    getAllByUserId = jest.fn();
    getCountByUserId = jest.fn();
    getCountByPostId = jest.fn();
}