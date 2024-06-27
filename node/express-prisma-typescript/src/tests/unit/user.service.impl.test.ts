import { S3ServiceImplMock } from "@aws/service";
import { FollowerRepositoryImplMock } from "@domains/follower";
import { FollowDTO } from "@domains/follower/dto";
import { ExtendedUserViewDTO, UserDTO, UserViewDTO } from "@domains/user/dto";
import { UserRepositoryImplMock } from "@domains/user/repository";
import { UserServiceImpl } from "@domains/user/service";
import { OffsetPagination } from "@types";

const userRepository = new UserRepositoryImplMock();
const followRepository = new FollowerRepositoryImplMock();
const s3client = new S3ServiceImplMock();

const userService = new UserServiceImpl(
    userRepository,
    followRepository,
    s3client
);
const options: OffsetPagination ={
    limit: undefined,
    skip: undefined,
}
const otherUserDto = new UserDTO({
    id: "OtherUserId",
    biography: null,
    createdAt: new Date(),
    image: "UserPicture.jpg",
    name: null,
    username: "Username"
},)
const followDto = new FollowDTO({
    id: "FollowId",
    followerId: "UserId",
    followedId: "OtherUserId",
})
const updateUserData ={
    name: "TestName",
    image: "TestImage.jpg",
    biography: "TestBiography"
}
describe("UserServiceImpl",()=>{
    beforeEach(() => {
        jest.clearAllMocks();
    });
      
    test("getUser_success", async()=>{
        userRepository.getById.mockResolvedValue(otherUserDto)
        followRepository.getFollowId.mockResolvedValue(followDto)
        s3client.GetObjectFromS3.mockResolvedValue("LinkOfPicture")
        
        const user = await userService.getUser("UserId",otherUserDto.id);

        expect(userRepository.getById).toHaveBeenCalledWith(otherUserDto.id)
        expect(followRepository.getFollowId).toHaveBeenCalledWith("UserId", otherUserDto.id);
        expect(s3client.GetObjectFromS3).toHaveBeenCalledTimes(1)
        expect(user).toBeInstanceOf(ExtendedUserViewDTO)
        expect(user).not.toBeNull()
    });
    test("updateUser_success", async()=>{
        userRepository.update.mockResolvedValue(otherUserDto)
        s3client.PutObjectFromS3.mockResolvedValue("LinkOfPicture")
        
        const user = await userService.updateUser("UserId",updateUserData);

        expect(userRepository.update).toHaveBeenCalledWith("UserId",updateUserData)
        expect(s3client.PutObjectFromS3).toHaveBeenCalledTimes(1)
        expect(user).toBeInstanceOf(UserDTO)
        expect(user).not.toBeNull()
    });
    test("getUserRecommendations_success", async()=>{
        userRepository.getRecommendedUsersPaginated.mockResolvedValue([otherUserDto])
        s3client.GetObjectFromS3.mockResolvedValue("LinkOfPicture")

        const users = await userService.getUserRecommendations("UserId", options);
        
        expect(userRepository.getRecommendedUsersPaginated).toHaveBeenCalledWith(options)
        expect(s3client.GetObjectFromS3).toHaveBeenCalledTimes(1)
        expect(Array.isArray(users)).toBe(true);
        users.forEach(user => {expect(user).toBeInstanceOf(UserViewDTO);});
        expect(users).not.toBeNull()
    })
    test("getUsersByUsername_success", async()=>{
        userRepository.getAllByUsernamePaginated.mockResolvedValue([otherUserDto])
        s3client.GetObjectFromS3.mockResolvedValue("LinkOfPicture")

        const users = await userService.getUsersByUsername(otherUserDto.username, options);
        
        expect(userRepository.getAllByUsernamePaginated).toHaveBeenCalledWith(otherUserDto.username,options)
        expect(s3client.GetObjectFromS3).toHaveBeenCalledTimes(1)
        expect(Array.isArray(users)).toBe(true);
        users.forEach(user => {expect(user).toBeInstanceOf(UserViewDTO);});
        expect(users).not.toBeNull()
    })
    test("getUsersByUsername_success", async()=>{
        userRepository.getById.mockResolvedValue(otherUserDto)

        await userService.deleteUser("UserId");
        
        expect(userRepository.getById).toHaveBeenCalledWith("UserId")
        expect(userRepository.delete).toHaveBeenCalled()
    })
    test("getUsersByUsername_NotFoundUser", async()=>{
        userRepository.getById.mockResolvedValue(null)
        await expect(userService.deleteUser("UserId")).rejects.toThrow();
        expect(userRepository.getById).toHaveBeenCalledWith("UserId")
    })
    
})