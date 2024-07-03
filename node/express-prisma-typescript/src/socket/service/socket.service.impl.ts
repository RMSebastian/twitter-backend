import { SocketService } from ".";
import { FollowerRepository } from "@domains/follower";
import { ChatRepository } from "@socket/repository";
import { ChatDTO, CreateMessageInputDTO, CreateRoomInputDTO, MessageDTO } from "@socket/dto";
import { UserDTO } from "@domains/user/dto";
import { UserRepository } from "@domains/user/repository";

export class SocketServiceImpl implements SocketService{
    constructor (
        private readonly followRepository: FollowerRepository,
        private readonly socketRepository: ChatRepository,
        private readonly userRepository: UserRepository,
    ){}
    async createChat(userId: string,data: CreateRoomInputDTO): Promise<ChatDTO | null> {
        const otherUser = await this.userRepository.getById(data.otherUserId);
        if (!otherUser) return null;

        const existingChat = await this.socketRepository.getChatByUsers(userId,data.otherUserId);
        if (existingChat) return existingChat;

        const friendship = await this.followRepository.getRelationshipOfUsers(userId,data.otherUserId)
        if(!friendship) return null;
        const chat = await this.socketRepository.createChat(userId,data.otherUserId);
        return chat
    }
    async recoverChats(userId: string): Promise<UserDTO[]> {
        return await this.followRepository.getRelationshipsByUserId(userId);
    }
    async createMessage(userId: string,data: CreateMessageInputDTO): Promise<MessageDTO | null> {     
        const existingChat = await this.socketRepository.getChatById(userId,data.chatId);
        if (!existingChat) return null;
        
        return await this.socketRepository.createMessage(userId,data.chatId,data.content);
    }
    async getById(userId: string, chatId: string): Promise<ChatDTO | null> {
        return await this.socketRepository.getChatById(userId,chatId);
    }
}