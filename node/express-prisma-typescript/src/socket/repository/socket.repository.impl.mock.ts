import { SocketRepository } from "./socket.repository";

export class SocketRepositoryImplMock implements SocketRepository{
    createChat = jest.fn()
    getChatByUsers = jest.fn()
    recoverChats = jest.fn()
    createMessage = jest.fn()
    getChatById = jest.fn()
}