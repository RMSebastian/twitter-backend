
import { UserDTO } from "@domains/user/dto";
import { FollowerRepository } from "./follower.repository";

export class FollowerRepositoryImplMock implements FollowerRepository{
    getFollowerUsers = jest.fn()
    getFollowedIds = jest.fn();
    getFollowedUsers = jest.fn();
    create = jest.fn();
    delete = jest.fn();
    getFollowId = jest.fn();
    getFollowerIds= jest.fn();
    getRelationshipsByUserId = jest.fn();
    getRelationshipOfUsers = jest.fn();
}