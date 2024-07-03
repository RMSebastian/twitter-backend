import { ChatRepository } from "./chat.repository";

export class ChatRepositoryImplMock implements ChatRepository{
    createChat = jest.fn()
    getChatByUsers = jest.fn()
    recoverChats = jest.fn()
    createMessage = jest.fn()
    getChatById = jest.fn()
}