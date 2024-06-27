import { SocketService } from ".";
import { FollowerRepository } from "@domains/follower";
import { SocketRepository } from "@socket/repository";
import { ChatDTO, MessageDTO } from "@socket/dto";
import { UserDTO } from "@domains/user/dto";
import { UserRepository } from "@domains/user/repository";

export class SocketServiceImpl implements SocketService{
    constructor (
        private readonly followRepository: FollowerRepository,
        private readonly socketRepository: SocketRepository,
        private readonly userRepository: UserRepository,
    ){}
    async createChat(userId: string,otherUserId: string): Promise<ChatDTO | null> {
        const otherUser = await this.userRepository.getById(otherUserId);
        if (!otherUser) return null;

        const existingChat = await this.socketRepository.getChatByUsers(userId,otherUserId);
        if (existingChat) return existingChat;

        const friendship = await this.followRepository.getRelationshipOfUsers(userId,otherUserId)
        if(!friendship) return null;
        const chat = await this.socketRepository.createChat(userId,otherUserId);
        return chat
    }
    async recoverChats(userId: string): Promise<UserDTO[]> {
        return await this.followRepository.getRelationshipsByUserId(userId);
    }
    async createMessage(userId: string,chatId: string, content: string): Promise<MessageDTO | null> {     
        const existingChat = await this.socketRepository.getChatById(userId,chatId);
        if (!existingChat) return null;
        
        return await this.socketRepository.createMessage(userId,chatId,content);
    }
    async getById(userId: string, chatId: string): Promise<ChatDTO | null> {
        return await this.socketRepository.getChatById(userId,chatId);
    }
}