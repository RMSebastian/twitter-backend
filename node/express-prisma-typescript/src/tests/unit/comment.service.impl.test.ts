import { S3ServiceImplMock } from "@aws/service";
import { CommentRepositoryImplMock } from "@domains/comment/repository";
import { CommentServiceImpl } from "@domains/comment/service";
import { CreatePostInputDTO, ExtendedPostDTO } from "@domains/post/dto";
import { UserDTO } from "@domains/user/dto";
import { UserRepositoryImplMock } from "@domains/user/repository";
import { CursorPagination } from "@types";

// Mock implementations
const commentRepository = new CommentRepositoryImplMock();
const userRepository = new UserRepositoryImplMock();
const s3client = new S3ServiceImplMock();

const options: CursorPagination = {
    limit: undefined,
    before: undefined,
    after: undefined
};

const commentService = new CommentServiceImpl(
    commentRepository,
    s3client
);

const userDto: UserDTO = {
    id: "OtherUserId",
    biography: null,
    createdAt: new Date(),
    image: "UserPicture.jpg",
    name: null,
    username: "Username",
    isPrivate: false
};

const postDto: ExtendedPostDTO = {
    id: "PostId",
    parentId: null,
    authorId: "UserId",
    content: "Example one: content",
    images: ["test.jpg"],
    createdAt: new Date(),
    author: userDto,
    comments: 0,
    reactions: []
};

const commentDto: ExtendedPostDTO = {
    id: "CommentId",
    parentId: "PostId",
    authorId: "OtherUserId",
    content: "Example two: content",
    images: ["CommentPicture.jpg"],
    createdAt: new Date(),
    author: userDto,
    comments: 0,
    reactions: []
};

const createPostData: CreatePostInputDTO = {
    parentId: "PostId",
    content: "Example content",
    images: ["test.jpg"]
};

describe("CommentServiceImpl", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("createComment_success", async () => {
        s3client.PutObjectFromS3.mockResolvedValue("LinkOfPicture");
        commentRepository.create.mockResolvedValue(commentDto);
        userRepository.getById.mockResolvedValue(userDto);
        s3client.GetObjectFromS3.mockResolvedValue("LinkOfPicture");

        const post = await commentService.createComment(userDto.id, createPostData);

        expect(commentRepository.create).toHaveBeenCalledWith(userDto.id, createPostData);
        expect(s3client.PutObjectFromS3).toHaveBeenCalledTimes(1);
        expect(post).not.toBeNull();
    });

    test("deleteComment_success", async () => {
        commentRepository.getById.mockResolvedValue(commentDto);

        await commentService.deleteComment(userDto.id, commentDto.id);

        expect(commentRepository.getById).toHaveBeenCalledWith(commentDto.id);
        expect(commentRepository.delete).toHaveBeenCalledWith(commentDto.id);
    });

    test("deleteComment_NotFoundException_error", async () => {
        commentRepository.getById.mockResolvedValue(null);

        await expect(commentService.deleteComment(userDto.id, commentDto.id)).rejects.toThrow();

        expect(commentRepository.getById).toHaveBeenCalledWith(commentDto.id);
    });

    test("deleteComment_AuthorForbidden_error", async () => {
        commentRepository.getById.mockResolvedValue(postDto);

        await expect(commentService.deleteComment(userDto.id, commentDto.id)).rejects.toThrow();

        expect(commentRepository.getById).toHaveBeenCalledWith(commentDto.id);
    });

    test("getLatestComments_success", async () => {
        commentRepository.getAllById.mockResolvedValue([commentDto]);
        s3client.GetObjectFromS3.mockResolvedValue("LinkOfPicture");
    
        const comments = await commentService.getLatestComments(userDto.id, options);
    
        expect(commentRepository.getAllById).toHaveBeenCalledWith(userDto.id, options);
        expect(s3client.GetObjectFromS3).toHaveBeenCalledTimes(1);
    });

    test("getCommentsByPostId_success", async () => {
        commentRepository.getAllByPostId.mockResolvedValue([commentDto]);
        s3client.GetObjectFromS3.mockResolvedValue("LinkOfPicture");
    
        const comments = await commentService.getCommentsByPostId(postDto.id, options);
    
        expect(commentRepository.getAllByPostId).toHaveBeenCalledWith(postDto.id, options);
        expect(s3client.GetObjectFromS3).toHaveBeenCalledTimes(1);
    });
});
