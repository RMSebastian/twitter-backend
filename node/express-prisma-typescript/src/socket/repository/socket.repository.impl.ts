import { PrismaClient } from "@prisma/client";
import { SocketRepository } from "./socket.repository";
import { ChatDTO, MessageDTO } from "@socket/dto";

export class SocketRepositoryImpl implements SocketRepository{
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
                messages: true,
            }
        })
        return new ChatDTO({
            id: chat.id,
            createdAt: chat.createdAt,
            messages: chat.messages.map((message) => new MessageDTO(message)),
            usersId: chat.users.map((user)=> user.id)
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
              messages: true,
            },
          });
        return(chat != null)?new ChatDTO({
            id: chat.id,
            createdAt: chat.createdAt,
            messages: chat.messages.map((message) => new MessageDTO(message)),
            usersId: chat.users.map((user)=> user.id)
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
            include:{
                users: true,
                messages: true,
            }
        })
        return chats.map((chat) =>{
            return new ChatDTO({
                id: chat.id,
                createdAt: chat.createdAt,
                messages: chat.messages.map((message) => new MessageDTO(message)),
                usersId: chat.users.map((user)=> user.id)
            });
        })
    }
    async createMessage(userId: string, chatId: string, content: string): Promise<MessageDTO> {
        const message = await this.db.message.create({
            data:{
                content: content,
                author:{
                    connect:{
                        id: userId
                    }
                },
                chat:{
                    connect:{
                        id: chatId
                    }
                }
            }
        });

        return new MessageDTO(message);
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
            include:{
                users: true,
                messages: true
            }
        });

        if(chat != null){
            return new ChatDTO({
                id: chat.id,
                createdAt: chat.createdAt,
                messages: chat.messages.map((message) => new MessageDTO(message)),
                usersId: chat.users.map((user)=> user.id)
            });
        }else{
            return null
        }
        
    }
}