import { UserDTO } from "@domains/user/dto";
import { ChatDTO, CreateMessageInputDTO, CreateRoomInputDTO, MessageDTO } from "@socket/dto";

export interface SocketService{
    recoverChats(userId: string): Promise<UserDTO[]>
    createMessage(userId: string,data: CreateMessageInputDTO): Promise<MessageDTO | null>
    createChat(userId: string,otherUserId: CreateRoomInputDTO):Promise<ChatDTO | null>
    getById(userId: string,chatId: string): Promise<ChatDTO | null> ;
}