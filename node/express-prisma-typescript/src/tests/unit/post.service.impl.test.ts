import { S3ServiceImplMock } from "@aws/service";
import { FollowerRepositoryImplMock } from "@domains/follower";
import { PostRepositoryImplMock } from "@domains/post/repository";
import { PostServiceImpl } from "@domains/post/service";
import { UserRepositoryImplMock } from "@domains/user/repository";
import { ExtendedPostDTO } from "@domains/post/dto";
import { CursorPagination } from "@types";
import { ForbiddenException, NotFoundException } from '@utils';
import { FollowDTO } from "@domains/follower/dto";

const postRepository = new PostRepositoryImplMock();
const followRepository = new FollowerRepositoryImplMock();
const userRepository = new UserRepositoryImplMock();
const s3client = new S3ServiceImplMock();

const postService = new PostServiceImpl(
    postRepository,
    followRepository,
    userRepository,
    s3client
);

const userDto = {
    id: "UserId",
    biography: null,
    createdAt: new Date(),
    image: "UserPicture.jpg",
    name: null,
    username: "Username",
    isPrivate: false
};

const otherUserDto = {
    id: "OtherUserId",
    biography: null,
    createdAt: new Date(),
    image: "OtherUserPicture.jpg",
    name: null,
    username: "Username",
    isPrivate: false
};

const postDto: ExtendedPostDTO = {
    id: "PostId",
    parentId: null,
    authorId: "OtherUserId",
    content: "Example one: content",
    images: ["test.jpg"],
    createdAt: new Date(),
    author: userDto,
    comments: [],
    reactions: []
};

const createPostData = {
    content: "Example content",
    images: ["test.jpg"]
};

const followDto: FollowDTO ={
    followedId:"UserId",
    followerId:"OtherUserId",
    id: "FollowId"
}

const options: CursorPagination = {
    limit: undefined,
    before: undefined,
    after: undefined
};

describe("PostServiceImpl", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("creationPost_success", async () => {
        s3client.PutObjectFromS3.mockResolvedValue("LinkOfPicture");
        s3client.GetObjectFromS3.mockResolvedValue("LinkOfPicture");
        postRepository.create.mockResolvedValue(postDto);

        const post = await postService.createPost(userDto.id, createPostData);

        expect(postRepository.create).toHaveBeenCalledWith(userDto.id, createPostData);
        expect(s3client.PutObjectFromS3).toHaveBeenCalled();
        expect(post).not.toBeNull();
    });

    test("deletePost_success", async () => {
        postRepository.getById.mockResolvedValue({
            ...postDto,
            authorId: userDto.id
        });
    
        await postService.deletePost(userDto.id, postDto.id);
    
        expect(postRepository.getById).toHaveBeenCalledWith(postDto.id);
        expect(postRepository.delete).toHaveBeenCalledWith(postDto.id);
    });

    test("deletePost_notFound", async () => {
        postRepository.getById.mockResolvedValue(null);

        await expect(postService.deletePost(userDto.id, postDto.id)).rejects.toThrow(NotFoundException);
    });

    test("deletePost_forbidden", async () => {
        postRepository.getById.mockResolvedValue({
            ...postDto,
            authorId: "DifferentUserId"
        });
    
        await expect(postService.deletePost(userDto.id, postDto.id)).rejects.toThrow(ForbiddenException);
    });

    test("getPost_success", async () => {
        postRepository.getById.mockResolvedValue(postDto);
        userRepository.getPrivacyById.mockResolvedValue({ privacy: "public" });
        followRepository.getFollowId.mockResolvedValue(followDto);
    
        const post = await postService.getPost(userDto.id, postDto.id);
    
        expect(postRepository.getById).toHaveBeenCalledWith(postDto.id);
        expect(userRepository.getPrivacyById).toHaveBeenCalledWith(postDto.authorId);
        expect(followRepository.getFollowId).toHaveBeenCalledWith(userDto.id, postDto.authorId);
        expect(s3client.GetObjectFromS3).toHaveBeenCalledTimes(1);
        expect(post).not.toBeNull();
    });

    test("getPost_notFound", async () => {
        postRepository.getById.mockResolvedValue(null);

        await expect(postService.getPost(userDto.id, postDto.id)).rejects.toThrow(NotFoundException);
    });

    test("getPost_userNotFound", async () => {
        postRepository.getById.mockResolvedValue(postDto);
        userRepository.getPrivacyById.mockResolvedValue(null);

        await expect(postService.getPost(userDto.id, postDto.id)).rejects.toThrow(NotFoundException);
    });

    test("getPost_followNotFound", async () => {
        postRepository.getById.mockResolvedValue(postDto);
        userRepository.getPrivacyById.mockResolvedValue(true);
        followRepository.getFollowId.mockResolvedValue(null);

        await expect(postService.getPost(userDto.id, postDto.id)).rejects.toThrow(NotFoundException);
    });

    test("getLatestPosts_success", async () => {
        const id = otherUserDto.id
        
        followRepository.getFollowerIds.mockResolvedValue([id]);
        postRepository.getAllByDatePaginated.mockResolvedValue([postDto]);
        s3client.GetObjectFromS3.mockResolvedValue("LinkOfPicture");

        const posts = await postService.getLatestPosts(userDto.id, options);
        expect(s3client.GetObjectFromS3).toHaveBeenCalledTimes(1);
        expect(posts).not.toBeNull();
    });

    test("getPostsByAuthor_success", async () => {
        postRepository.getByAuthorId.mockResolvedValue([postDto]);
        userRepository.getPrivacyById.mockResolvedValue(true);
        followRepository.getFollowId.mockResolvedValue(followDto);
        s3client.GetObjectFromS3.mockResolvedValue("LinkOfPicture");

        const posts = await postService.getPostsByAuthor(userDto.id, otherUserDto.id);

        expect(postRepository.getByAuthorId).toHaveBeenCalledWith(otherUserDto.id);
        expect(userRepository.getPrivacyById).toHaveBeenCalledWith(otherUserDto.id);
        expect(followRepository.getFollowId).toHaveBeenCalledWith(userDto.id, otherUserDto.id);
        expect(s3client.GetObjectFromS3).toHaveBeenCalledTimes(1);
        expect(posts).not.toBeNull();
    });

    test("getPostsByAuthor_userNotFound", async () => {
        userRepository.getPrivacyById.mockResolvedValue(null);

        await expect(postService.getPostsByAuthor(userDto.id, otherUserDto.id)).rejects.toThrow(NotFoundException);
    });

    test("getPostsByAuthor_followNotFound", async () => {
        userRepository.getPrivacyById.mockResolvedValue(true);
        followRepository.getFollowId.mockResolvedValue(null);

        await expect(postService.getPostsByAuthor(userDto.id, otherUserDto.id)).rejects.toThrow(NotFoundException);
    });
});
