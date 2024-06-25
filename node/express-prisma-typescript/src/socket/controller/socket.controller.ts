import { SocketBodyValidation, db, withAuthSocket } from '@utils'
import { Server } from 'socket.io';
import { SocketService, SocketServiceImpl } from '@socket/service';
import { FollowerRepositoryImpl } from '@domains/follower';
import { SocketRepositoryImpl } from '@socket/repository';
import { CreateMessageInputDTO, CreateRoomInputDTO } from '@socket/dto';

import { UserRepositoryImpl } from '@domains/user/repository';

const service: SocketService = new SocketServiceImpl(
  new FollowerRepositoryImpl(db),
  new SocketRepositoryImpl(db),
  new UserRepositoryImpl(db)
);
export function SetupSocketIO(io: Server){
    io.use(withAuthSocket);

    io.on('connection', (socket)=>{
      console.log("Client Connected 👨‍🦱");

      socket.on('joinLobby', async()=>{

        const {userId} = socket.decoded

        const chats = await service.recoverChats(userId);

        if(chats != null)socket.emit('joinLobby', JSON.stringify(chats));

        else socket.emit('joinLobby', "no friends")

        
      });
      socket.on('createRoom',async (data: any)=>{

        const validation = await SocketBodyValidation(CreateRoomInputDTO,data)

        if(!validation){socket.emit('error', {description: "invalid data structure"});;return;}

        const {userId} = socket.decoded;

        const {otherUserId}= data;

        const chat = await service.createChat(userId, otherUserId);
        
        if(chat != null){
          socket.join(chat.id);

          const json = JSON.stringify(chat)

          socket.emit('createRoom', json);
        }
        else socket.emit('error', {description: "failure on creation of room"});

        
      });

      socket.on('createMessage', async (data: any)=>{

        const validation = await SocketBodyValidation(CreateMessageInputDTO,data)

        if(!validation){socket.emit('error', {description: "invalid data structure"});;return;}

        const {userId} = socket.decoded;

        const {chatId, content} = data;

        const message = await service.createMessage(userId,chatId,content);

        const json = JSON.stringify(message)
        if(message != null){
          socket.to(message.chatId).emit('createMessage',json);

          socket.emit('createMessage', json);
        }
        else socket.emit('error', {description: "failure on creation of message"});

      });
    });
}