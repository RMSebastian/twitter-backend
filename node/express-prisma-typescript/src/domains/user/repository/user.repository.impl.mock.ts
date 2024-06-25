import { UserRepository } from "./user.repository";

export class UserRepositoryImplMock implements UserRepository{
    create = jest.fn()
    update = jest.fn()
    delete = jest.fn()
    getRecommendedUsersPaginated = jest.fn()
    getById = jest.fn()
    getPrivacyById = jest.fn()
    getByEmailOrUsername = jest.fn()
    getAllByUsernamePaginated = jest.fn()
}