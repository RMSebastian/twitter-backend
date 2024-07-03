import { ChatDTO, MessageDTO } from "@socket/dto";

export interface ChatRepository{
    createChat(userId: string,otherUserId: string):Promise<ChatDTO>
    getChatByUsers(userId: string, otherUserId:string): Promise<ChatDTO | null> 
    recoverChats(userId: string): Promise<ChatDTO[]> 
    createMessage(userId: string,chatId: string, content: string): Promise<MessageDTO>
    getChatById(userId: string,chatId: string):Promise<ChatDTO | null> 
}