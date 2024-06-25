
import { FollowerRepository } from "./follower.repository";

export class FollowerRepositoryImplMock implements FollowerRepository{
    create = jest.fn();
    delete = jest.fn();
    getFollowId = jest.fn();
    getFollowedIds= jest.fn();
    getRelationshipsByUserId = jest.fn();
    getRelationshipOfUsers = jest.fn();
}