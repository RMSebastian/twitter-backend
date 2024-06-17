
export class ChatDTO {
    constructor (chat: ChatDTO) {
        this.id = chat.id;
        this.createdAt = chat.createdAt;
        this.messages = chat.messages;
        this.usersId = chat.usersId
    }
    id: string;
    usersId: string[]
    messages: MessageDTO[]
    createdAt: Date;
}

export class MessageDTO{
    constructor (message: MessageDTO) {
        this.id = message.id;
        this.chatId = message.chatId;
        this.authorId = message.authorId;
        this.content = message.content;
        this.createdAt = message.createdAt;
    }
    id: string;
    chatId: string;
    authorId: string;
    content: string
    createdAt: Date;
}