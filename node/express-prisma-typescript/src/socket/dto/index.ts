import { UserViewDTO } from "@domains/user/dto";
import { IsNotEmpty, IsString, IsUUID, MaxLength } from "class-validator";

export class ChatDTO {
    constructor (chat: ChatDTO) {
        this.id = chat.id;
        this.createdAt = chat.createdAt;
        this.messages = chat.messages;
        this.users = chat.users
    }
    id: string;
    users: UserViewDTO[]
    messages: MessageDTO[]
    createdAt: Date;
}

export class MessageDTO{
    constructor (message: MessageDTO) {
        this.id = message.id;
        this.chatId = message.chatId;
        this.senderId = message.senderId;
        this.sender = message.sender;
        this.content = message.content;
        this.createdAt = message.createdAt;
    }
    id: string;
    chatId: string;
    sender: UserViewDTO
    senderId: string;
    content: string
    createdAt: Date;
}

export class CreateRoomInputDTO {
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    otherUserId!: string 
    
    constructor (otherUserId: string) {
        this.otherUserId = otherUserId
    }
}
export class CreateMessageInputDTO {
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    chatId!: string 
    @IsString()
    @IsNotEmpty()
    @MaxLength(240)
    content!: string
    
    constructor (chatId: string, content: string) {
        this.chatId = chatId;
        this.content = content;
    }
}