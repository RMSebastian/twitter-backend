import { SocketService } from ".";
import { FollowerRepository } from "@domains/follower";
import { SocketRepository } from "@socket/repository";
import { ChatDTO, MessageDTO } from "@socket/dto";
import { ConflictException } from "@utils";

export class SocketServiceImpl implements SocketService{
    constructor (
        private readonly followRepository: FollowerRepository,
        private readonly socketRepository: SocketRepository,

    ){}
    async joinMaster(userId: string): Promise<ChatDTO[]> {
        if(userId == null) {
            throw new ConflictException("UserID is null");
        }
        const recoverChats = await this.recoverChats(userId);
        return recoverChats
    }
    async createChat(userId: string,otherUserId: string): Promise<ChatDTO> {
       return await this.socketRepository.createChat(userId,otherUserId);
    }
    async recoverChats(userId: string): Promise<ChatDTO[]> {
        return await this.socketRepository.recoverChats(userId);
    }
    async createMessage(userId: string,chatId: string, content: string): Promise<MessageDTO> {        
        return await this.socketRepository.createMessage(userId,chatId,content);
    }
}