import { ChatDTO, MessageDTO } from "@socket/dto";

export interface SocketService{
    recoverChats(userId: string): Promise<ChatDTO[]>
    createMessage(userId: string,chatId: string, content: string): Promise<MessageDTO>
    createChat(userId: string,otherUserId: string):Promise<ChatDTO>
}