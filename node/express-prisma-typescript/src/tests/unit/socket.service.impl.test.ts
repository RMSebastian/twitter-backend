import { FollowerRepositoryImplMock } from "@domains/follower";
import { UserDTO } from "@domains/user/dto";
import { MessageDTO,ChatDTO, CreateRoomInputDTO } from "@socket/dto";
import { UserRepositoryImplMock } from "@domains/user/repository";
import { ChatRepositoryImplMock } from "@socket/repository";
import { SocketServiceImpl } from "@socket/service";


const followRepository = new FollowerRepositoryImplMock();
const userRepository = new UserRepositoryImplMock();
const socketRepository = new ChatRepositoryImplMock();
const userDto = new UserDTO({
    id: "UserId",
    biography: null,
    createdAt: new Date(),
    image: "UserPicture.jpg",
    name: null,
    username: "Username",
    isPrivate: false
},)
const createRoomData= {
    otherUserId: "OtherUserId"
}
const createMessageData= {
    chatId: "chatId",
    content: "content"
}
const otherUserDto = new UserDTO({
    id: "OtherUserId",
    biography: null,
    createdAt: new Date(),
    image: "OtherUserPicture.jpg",
    name: null,
    username: "OtherUsername",
    isPrivate: false
},)
const messageDto = new MessageDTO({
    chatId: "ChatId",
    authorId: "UserId",
    content:"Testing content",
    createdAt: new Date(),
    id:"MessageId"
})
const newChatDto = new ChatDTO({
    id: "ChatId",
    createdAt: new Date(),
    messages: [],
    users:["UserId","OtherUserId"]
})
const chatDto = new ChatDTO({
    id: "ChatId",
    createdAt: new Date(),
    messages: [messageDto],
    users:["UserId","OtherUserId"]
})
const socketService = new SocketServiceImpl(
    followRepository,
    socketRepository,
    userRepository,
);

describe("SocketServiceImpl",()=>{
    beforeEach(() => {
        jest.clearAllMocks();
    });
      
    
    test("createChat_success", async () => {
        userRepository.getById.mockResolvedValue(otherUserDto);
        socketRepository.getChatByUsers.mockResolvedValue(null);
        followRepository.getRelationshipOfUsers.mockResolvedValue(true);
        socketRepository.createChat.mockResolvedValue(newChatDto)

        const chat = await socketService.createChat(userDto.id, createRoomData);

        expect(userRepository.getById).toHaveBeenCalledWith(createRoomData.otherUserId);
        expect(socketRepository.getChatByUsers).toHaveBeenCalledWith(userDto.id, createRoomData.otherUserId);
        expect(followRepository.getRelationshipOfUsers).toHaveBeenCalledWith(userDto.id, createRoomData.otherUserId);
        expect(socketRepository.createChat).toHaveBeenCalledWith(userDto.id, createRoomData.otherUserId);
        expect(chat).toBeInstanceOf(ChatDTO);
        expect(chat).not.toBeNull();
    });
    test("createChat_existingChat", async () => {
        userRepository.getById.mockResolvedValue(otherUserDto);
        socketRepository.getChatByUsers.mockResolvedValue(chatDto);
    
        const chat = await socketService.createChat(userDto.id, createRoomData);
    
        expect(userRepository.getById).toHaveBeenCalledWith(createRoomData.otherUserId);
        expect(socketRepository.getChatByUsers).toHaveBeenCalledWith(userDto.id, createRoomData.otherUserId);
        expect(socketRepository.createChat).not.toHaveBeenCalled();
        expect(chat).toBeInstanceOf(ChatDTO);
        expect(chat).not.toBeNull();
    });
    test("createChat_failure_noOtherUser", async () => {
        userRepository.getById.mockResolvedValue(null);

        const chat = await socketService.createChat(userDto.id, createRoomData);

        expect(userRepository.getById).toHaveBeenCalledWith(createRoomData.otherUserId);
        expect(socketRepository.getChatByUsers).not.toHaveBeenCalled();
        expect(followRepository.getRelationshipOfUsers).not.toHaveBeenCalled();
        expect(socketRepository.createChat).not.toHaveBeenCalled();
        expect(chat).toBeNull();
    });

    test("createChat_failure_noFriendship", async () => {
        userRepository.getById.mockResolvedValue(otherUserDto);
        socketRepository.getChatByUsers.mockResolvedValue(null);
        followRepository.getRelationshipOfUsers.mockResolvedValue(null);

        const chat = await socketService.createChat(userDto.id, createRoomData);

        expect(userRepository.getById).toHaveBeenCalledWith(createRoomData.otherUserId);
        expect(socketRepository.getChatByUsers).toHaveBeenCalledWith(userDto.id, createRoomData.otherUserId);
        expect(followRepository.getRelationshipOfUsers).toHaveBeenCalledWith(userDto.id, createRoomData.otherUserId);
        expect(socketRepository.createChat).not.toHaveBeenCalled();
        expect(chat).toBeNull();
    });

    test("recoverChats_success", async () => {
        followRepository.getRelationshipsByUserId.mockResolvedValue([userDto]);

        const users = await socketService.recoverChats(userDto.id);

        expect(followRepository.getRelationshipsByUserId).toHaveBeenCalledWith(userDto.id);
        expect(users).toEqual([userDto]);
    });

    test("createMessage_success", async () => {
        socketRepository.getChatById.mockResolvedValue(chatDto);
        socketRepository.createMessage.mockResolvedValue(messageDto);

        const message = await socketService.createMessage(userDto.id, createMessageData);

        expect(socketRepository.getChatById).toHaveBeenCalledWith(userDto.id, createMessageData.chatId);
        expect(socketRepository.createMessage).toHaveBeenCalledWith(userDto.id,createMessageData.chatId, createMessageData.content);
        expect(message).toBeInstanceOf(MessageDTO);
        expect(message).not.toBeNull();
    });

    test("createMessage_failure_noChat", async () => {
        socketRepository.getChatById.mockResolvedValue(null);

        const message = await socketService.createMessage(userDto.id, createMessageData);

        expect(socketRepository.getChatById).toHaveBeenCalledWith(userDto.id, createMessageData.chatId);
        expect(socketRepository.createMessage).not.toHaveBeenCalled();
        expect(message).toBeNull();
    });

    test("getById_success", async () => {
        socketRepository.getChatById.mockResolvedValue(chatDto);

        const chat = await socketService.getById(userDto.id, chatDto.id);

        expect(socketRepository.getChatById).toHaveBeenCalledWith(userDto.id, chatDto.id);
        expect(chat).toBeInstanceOf(ChatDTO);
        expect(chat).not.toBeNull();
    });

    test("getById_failure_noChat", async () => {
        socketRepository.getChatById.mockResolvedValue(null);

        const chat = await socketService.getById(userDto.id, chatDto.id);

        expect(socketRepository.getChatById).toHaveBeenCalledWith(userDto.id, chatDto.id);
        expect(chat).toBeNull();
    });
})