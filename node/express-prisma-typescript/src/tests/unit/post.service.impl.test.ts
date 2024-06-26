import { S3ServiceImplMock } from "@aws/service";
import { FollowerRepositoryImplMock } from "@domains/follower";
import { PostDTO } from "@domains/post/dto";
import { PostRepositoryImplMock } from "@domains/post/repository";
import { PostServiceImpl } from "@domains/post/service";
import { ReactionRepositoryImplMock } from "@domains/reaction";
import { UserDTO } from "@domains/user/dto";
import { UserRepositoryImplMock } from "@domains/user/repository";
import { ReactionType } from "@prisma/client";
import { CursorPagination } from "@types";

const postRepository = new PostRepositoryImplMock();
const followRepository = new FollowerRepositoryImplMock();
const userRepository = new UserRepositoryImplMock();
const reactionRepository = new ReactionRepositoryImplMock();
const s3client = new S3ServiceImplMock();

const options: CursorPagination = {
    limit: undefined,
    before: undefined,
    after: undefined
}

const postService = new PostServiceImpl(
    postRepository,
    followRepository,
    userRepository,
    reactionRepository,
    s3client
);
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
    username: "Username"
},)
const postDto = new PostDTO({
    id:"PostId",
    authorId:"OtherUserId",
    content: "Example one: content",
    images: ["test.jpg"],
    createdAt: new Date(),
})
const createPostData: any ={
    content: "Example content",
    images: ["test.jpg"]
}
describe("PostServiceImpl",()=>{
    beforeEach(() => {
        jest.clearAllMocks();
    });
      
    test("", async()=>{
        
    })
    test("creationPost_sucess",async ()=>{
        s3client.PutObjectFromS3.mockResolvedValue("LinkOfPicture")
        postRepository.create.mockResolvedValue(postDto)
        const post = await postService.createPost(userDto.id,createPostData)

        expect(postRepository.create).toHaveBeenCalledWith(userDto.id,createPostData);
        expect(s3client.PutObjectFromS3).toHaveBeenCalled()
        expect(post).not.toBeNull();
        expect(post).toEqual(postDto);
    })
    test("deletePost_success", async()=>{
        postRepository.getById.mockResolvedValue(postDto)
        await postService.deletePost(otherUserDto.id,postDto.id)

        expect(postRepository.getById).toHaveBeenCalledWith(postDto.id)
        expect(postRepository.delete).toHaveBeenCalled();
    })
    test("deletePost_notFound", async () => {
        postRepository.getById.mockResolvedValue(null);
        await expect(postService.deletePost(userDto.id, postDto.id)).rejects.toThrow();
    });

    test("deletePost_forbidden", async () => {
        postRepository.getById.mockResolvedValue(postDto);
        await expect(postService.deletePost(userDto.id, postDto.id)).rejects.toThrow();
    });

    test("getPost_success", async()=>{
        postRepository.getById.mockResolvedValue(postDto)
        userRepository.getPrivacyById.mockResolvedValue(true)
        followRepository.getFollowId.mockResolvedValue("FollowId")
        s3client.GetObjectFromS3.mockResolvedValue("LinkOfPicture")

        const post = await postService.getPost(userDto.id,postDto.id)

        expect(postRepository.getById).toHaveBeenCalledWith(postDto.id);
        expect(userRepository.getPrivacyById).toHaveBeenCalledWith(postDto.authorId);
        expect(followRepository.getFollowId).toHaveBeenCalledWith(userDto.id, postDto.authorId);
        expect(s3client.GetObjectFromS3).toHaveBeenCalledTimes(1);
        expect(post).not.toBeNull();
    })
    test("getPost_notFound", async () => {
        postRepository.getById.mockResolvedValue(null);
        await expect(postService.getPost(userDto.id, postDto.id)).rejects.toThrow();
    })

    test("getPost_userNotFound", async () => {
        postRepository.getById.mockResolvedValue(postDto);
        userRepository.getPrivacyById.mockResolvedValue(null);
        await expect(postService.getPost(userDto.id, postDto.id)).rejects.toThrow();
    })

    test("getPost_followNotFound", async () => {
        postRepository.getById.mockResolvedValue(postDto);
        userRepository.getPrivacyById.mockResolvedValue(true);
        followRepository.getFollowId.mockResolvedValue(null);
        await expect(postService.getPost(userDto.id, postDto.id)).rejects.toThrow();
    })
    test("getLatestPosts_sucess", async()=>{
        followRepository.getFollowedIds.mockResolvedValue([otherUserDto])
        postRepository.getAllByDatePaginated.mockResolvedValue([postDto])
        postRepository.getCountByPostId.mockResolvedValue(1)
        reactionRepository.getCountByPostId.mockResolvedValue(2).mockResolvedValueOnce(4)
        userRepository.getById.mockResolvedValue(otherUserDto)
        s3client.GetObjectFromS3.mockResolvedValue("LinkOfPicture")

        const comment = await postService.getLatestPosts(userDto.id, options)
        
        expect(postRepository.getAllByDatePaginated).toHaveBeenCalledWith([otherUserDto], options);
        expect(userRepository.getById).toHaveBeenCalledWith(postDto.authorId);
        expect(postRepository.getCountByPostId).toHaveBeenCalledWith(postDto.id);
        expect(reactionRepository.getCountByPostId).toHaveBeenNthCalledWith(1, postDto.id, ReactionType.Like);
        expect(reactionRepository.getCountByPostId).toHaveBeenNthCalledWith(2, postDto.id, ReactionType.Retweet);
        expect(s3client.GetObjectFromS3).toHaveBeenCalledTimes(2);
        expect(comment).not.toBeNull();
    })
    test("getPostsByAuthor_success", async()=>{
        postRepository.getByAuthorId.mockResolvedValue([postDto])
        userRepository.getPrivacyById.mockResolvedValue(true)
        followRepository.getFollowId.mockResolvedValue("FollowId")
        s3client.GetObjectFromS3.mockResolvedValue("LinkOfPicture")

        const post = await postService.getPostsByAuthor(userDto.id,otherUserDto.id)

        expect(userRepository.getPrivacyById).toHaveBeenCalledWith(otherUserDto.id);
        expect(followRepository.getFollowId).toHaveBeenCalledWith(userDto.id, otherUserDto.id);
        expect(postRepository.getByAuthorId).toHaveBeenCalledWith(otherUserDto.id);
        expect(s3client.GetObjectFromS3).toHaveBeenCalledTimes(2);
        expect(post).not.toBeNull();
    })
    test("getPostsByAuthor_followNotFound", async () => {
        userRepository.getPrivacyById.mockResolvedValue(null);
        await expect(postService.getPostsByAuthor(userDto.id, otherUserDto.id)).rejects.toThrow();
    })
    test("getPostsByAuthor_followNotFound", async () => {
        userRepository.getPrivacyById.mockResolvedValue(true);
        followRepository.getFollowId.mockResolvedValue(null);
        await expect(postService.getPostsByAuthor(userDto.id, otherUserDto.id)).rejects.toThrow();
    })

    test("getLatestPosts_userNotFound", async () => {
        followRepository.getFollowedIds.mockResolvedValue([otherUserDto]);
        postRepository.getAllByDatePaginated.mockResolvedValue([postDto]);
        userRepository.getById.mockResolvedValue(null);
        await expect(postService.getLatestPosts(userDto.id, options)).rejects.toThrow();
    })

    test("getLatestPosts_urlNotFound", async () => {
        followRepository.getFollowedIds.mockResolvedValue([otherUserDto]);
        postRepository.getAllByDatePaginated.mockResolvedValue([postDto]);
        userRepository.getById.mockResolvedValue(otherUserDto);
        s3client.GetObjectFromS3.mockResolvedValue(null);
        await expect(postService.getLatestPosts(userDto.id, options)).rejects.toThrow();
    });
})