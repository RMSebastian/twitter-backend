import { FollowerRepositoryImplMock } from "@domains/follower";
import { UserDTO } from "@domains/user/dto";
import { MessageDTO,ChatDTO } from "@socket/dto";
import { UserRepositoryImplMock } from "@domains/user/repository";
import { SocketRepositoryImplMock } from "@socket/repository";
import { SocketServiceImpl } from "@socket/service";


const followRepository = new FollowerRepositoryImplMock();
const userRepository = new UserRepositoryImplMock();
const socketRepository = new SocketRepositoryImplMock();
const userDto = new UserDTO({
    id: "UserId",
    biography: null,
    createdAt: new Date(),
    image: "UserPicture.jpg",
    name: null,
    username: "Username"
},)
const otherUserDto = new UserDTO({
    id: "OtherUserId",
    biography: null,
    createdAt: new Date(),
    image: "OtherUserPicture.jpg",
    name: null,
    username: "OtherUsername"
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
    usersId:["UserId","OtherUserId"]
})
const chatDto = new ChatDTO({
    id: "ChatId",
    createdAt: new Date(),
    messages: [messageDto],
    usersId:["UserId","OtherUserId"]
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

        const chat = await socketService.createChat(userDto.id, otherUserDto.id);

        expect(userRepository.getById).toHaveBeenCalledWith(otherUserDto.id);
        expect(socketRepository.getChatByUsers).toHaveBeenCalledWith(userDto.id, otherUserDto.id);
        expect(followRepository.getRelationshipOfUsers).toHaveBeenCalledWith(userDto.id, otherUserDto.id);
        expect(socketRepository.createChat).toHaveBeenCalledWith(userDto.id, otherUserDto.id);
        expect(chat).toBeInstanceOf(ChatDTO);
        expect(chat).not.toBeNull();
    });
    test("createChat_existingChat", async () => {
        userRepository.getById.mockResolvedValue(otherUserDto);
        socketRepository.getChatByUsers.mockResolvedValue(chatDto);
    
        const chat = await socketService.createChat(userDto.id, otherUserDto.id);
    
        expect(userRepository.getById).toHaveBeenCalledWith(otherUserDto.id);
        expect(socketRepository.getChatByUsers).toHaveBeenCalledWith(userDto.id, otherUserDto.id);
        expect(socketRepository.createChat).not.toHaveBeenCalled();
        expect(chat).toBeInstanceOf(ChatDTO);
        expect(chat).not.toBeNull();
    });
    test("createChat_failure_noOtherUser", async () => {
        userRepository.getById.mockResolvedValue(null);

        const chat = await socketService.createChat(userDto.id, otherUserDto.id);

        expect(userRepository.getById).toHaveBeenCalledWith(otherUserDto.id);
        expect(socketRepository.getChatByUsers).not.toHaveBeenCalled();
        expect(followRepository.getRelationshipOfUsers).not.toHaveBeenCalled();
        expect(socketRepository.createChat).not.toHaveBeenCalled();
        expect(chat).toBeNull();
    });

    test("createChat_failure_noFriendship", async () => {
        userRepository.getById.mockResolvedValue(otherUserDto);
        socketRepository.getChatByUsers.mockResolvedValue(null);
        followRepository.getRelationshipOfUsers.mockResolvedValue(null);

        const chat = await socketService.createChat(userDto.id, otherUserDto.id);

        expect(userRepository.getById).toHaveBeenCalledWith(otherUserDto.id);
        expect(socketRepository.getChatByUsers).toHaveBeenCalledWith(userDto.id, otherUserDto.id);
        expect(followRepository.getRelationshipOfUsers).toHaveBeenCalledWith(userDto.id, otherUserDto.id);
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

        const message = await socketService.createMessage(userDto.id, chatDto.id, "Testing content");

        expect(socketRepository.getChatById).toHaveBeenCalledWith(userDto.id, chatDto.id);
        expect(socketRepository.createMessage).toHaveBeenCalledWith(userDto.id, chatDto.id, "Testing content");
        expect(message).toBeInstanceOf(MessageDTO);
        expect(message).not.toBeNull();
    });

    test("createMessage_failure_noChat", async () => {
        socketRepository.getChatById.mockResolvedValue(null);

        const message = await socketService.createMessage(userDto.id, chatDto.id, "Testing content");

        expect(socketRepository.getChatById).toHaveBeenCalledWith(userDto.id, chatDto.id);
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