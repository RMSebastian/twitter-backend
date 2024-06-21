import { UserDTO } from "@domains/user/dto";
import { ChatDTO, MessageDTO } from "@socket/dto";

export interface SocketService{
    recoverChats(userId: string): Promise<UserDTO[]>
    createMessage(userId: string,chatId: string, content: string): Promise<MessageDTO | null>
    createChat(userId: string,otherUserId: string):Promise<ChatDTO | null>
    getById(userId: string,chatId: string): Promise<ChatDTO | null> ;
}