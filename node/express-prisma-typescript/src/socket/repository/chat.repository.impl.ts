import { PrismaClient } from "@prisma/client";
import { ChatRepository } from "./chat.repository";
import { ChatDTO, MessageDTO } from "@socket/dto";
import { UserViewDTO } from "@domains/user/dto";

export class ChatRepositoryImpl implements ChatRepository{
    constructor(private readonly db: PrismaClient){}

    async createChat(userId: string, otherUserId: string): Promise<ChatDTO> {

        const chat = await this.db.chat.create({
            data: {
                users: {
                  connect: [
                    { id: userId },
                    { id: otherUserId }
                  ]
                },
                type: "Couple"
              },
            include:{
                users: true,
                messages: {
                    include:{
                        sender: true
                    }
                }
            }
        })
        

        return new ChatDTO({
            id: chat.id,
            createdAt: chat.createdAt,
            messages: chat.messages.map((message) => new MessageDTO({
            ...message,
            sender: new UserViewDTO(message.sender)
        })),
            users: chat.users.map((user)=> new UserViewDTO(user))
        });
    }
    async getChatByUsers(userId: string, otherUserId:string): Promise<ChatDTO | null> {
        const chat = await this.db.chat.findFirst({
            where: {
              AND: [
                {
                  users: {
                    some: {
                      id: userId,
                    },
                  },
                },
                {
                  users: {
                    some: {
                      id: otherUserId,
                    },
                  },
                },
              ],
              type: "Couple",
            },
            include: {
              users: true,
              messages: {
                include:{
                    sender: true
                }
              },
            },
          });
        return(chat != null)?new ChatDTO({
            id: chat.id,
            createdAt: chat.createdAt,
            messages: chat.messages.map((message) => new MessageDTO({
            ...message,
            sender: new UserViewDTO(message.sender)
        })),
            users: chat.users.map((user)=> new UserViewDTO(user))
        }):null;
    }
    async recoverChats(userId: string): Promise<ChatDTO[]> {
        const chats = await this.db.chat.findMany({
            where:{
                users:{
                    some:{
                        id: userId
                    }
                }
            },
            include: {
              users: true,
              messages: {
                include:{
                    sender: true
                }
              },
            }
        })
        return chats.map((chat) =>{
            return new ChatDTO({
                id: chat.id,
                createdAt: chat.createdAt,
                messages: chat.messages.map((message) => new MessageDTO({
                ...message,
                sender: new UserViewDTO(message.sender)
            })),
                users: chat.users.map((user)=> new UserViewDTO(user))
            });
        })
    }
    async createMessage(userId: string, chatId: string, content: string): Promise<MessageDTO> {
        const message = await this.db.message.create({
            data:{
                content: content,
                sender:{
                    connect:{
                        id: userId
                    }
                },
                chat:{
                    connect:{
                        id: chatId
                    }
                }
            },include:{
                sender: true
            }
        });

        return new MessageDTO({
            ...message,
            sender: new UserViewDTO(message.sender)
        });
    }
    async getChatById(userId: string, chatId: string): Promise<ChatDTO | null>  {
        const chat = await this.db.chat.findFirst({
            where:{
                id: chatId,
                users:{
                    some:{
                        id: userId,
                    },
                },
            },
            include: {
              users: true,
              messages: {
                include:{
                    sender: true
                }
              },
            }
        });

        if(chat != null){
            return new ChatDTO({
                id: chat.id,
                createdAt: chat.createdAt,
                messages: chat.messages.map((message) => new MessageDTO({
                ...message,
                sender: new UserViewDTO(message.sender)
            })),
                users: chat.users.map((user)=> new UserViewDTO(user))
            });
        }else{
            return null
        }
        
    }
}