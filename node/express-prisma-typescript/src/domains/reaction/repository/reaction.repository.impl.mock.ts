import { ReactionDTO } from "../dto";
import { ReactionRepository } from "./reaction.repository";

export class ReactionRepositoryImplMock implements ReactionRepository{
    getReactionById = jest.fn();
    create = jest.fn();
    delete = jest.fn();
    getReactionId = jest.fn();
    getAllByUserId = jest.fn();
    getCountByUserId = jest.fn();
    getCountByPostId = jest.fn();
}