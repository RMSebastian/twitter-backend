import { ChatDTO, MessageDTO } from "@socket/dto";

export interface SocketRepository{
    createChat(userId: string,otherUserId: string):Promise<ChatDTO>
    recoverChats(userId: string): Promise<ChatDTO[]> 
    createMessage(userId: string,chatId: string, content: string): Promise<MessageDTO>
}