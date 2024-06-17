import { ConflictException, db, withAuthSocket } from '@utils'
import { Server, Socket } from 'socket.io';
import { SocketService, SocketServiceImpl } from '@socket/service';
import { FollowerRepositoryImpl } from '@domains/follower';
import { SocketRepositoryImpl } from '@socket/repository';

const service: SocketService = new SocketServiceImpl(
  new FollowerRepositoryImpl(db),
  new SocketRepositoryImpl(db),
);

export function SetupSocketIO(io: Server){
    io.use(withAuthSocket);

    io.on('connection', (socket)=>{
      console.log("Client Connected 👨‍🦱")

      socket.on('join', async()=>{
        if (!socket.decoded) {
          console.error('No JWT decoded data available');
          return;
        }
        const {userId} = socket.decoded
        console.log(userId);
        console.log(socket.decoded);
        const chats = await service.recoverChats(userId);
        if(chats != null){

          const json = JSON.stringify(chats);

          chats.forEach((chat)=>{
            socket.join(chat.id);
            
          })
          socket.to(socket.id).emit('newChat', json);
        }
        else{
          socket.to(socket.id).emit('newChat', "no friends")
        }
      });
      socket.on('createChat',async (data: any)=>{
        if (!socket.decoded) {
          console.error('No JWT decoded data available');
          return;
        }
        const {userId} = socket.decoded;
        console.log(userId);
        const {otherUserId}= data;

        const chat = await service.createChat(userId, otherUserId);
        
        const json = JSON.stringify(chat);

        chat.usersId.forEach(userId => {
          const userSocket = io.sockets.sockets.get(userId);
          if (userSocket) {
            userSocket.join(chat.id);
          }
        });

        chat.usersId.forEach(user => {
          io.to(user).emit('newChat', json);
        });
      })
      socket.on('createMessage', async (data: any)=>{
        const {userId} = socket.decoded;
        const {chatId, content} = data;

        const message = await service.createMessage(userId,chatId,content);
        const json = JSON.stringify(message);

        socket.to(message.chatId).emit('newMessage',json);
      });
    
      socket.on('disconnect',()=>{
        console.log("user disconnected");
      })
    });
}