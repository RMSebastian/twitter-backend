import { S3ServiceImplMock } from "@aws/service";
import { CommentRepositoryImplMock } from "@domains/comment/repository";
import { CommentServiceImpl } from "@domains/comment/service";
import { FollowerRepositoryImplMock } from "@domains/follower";
import { ExtendedPostDTO, PostDTO } from "@domains/post/dto";
import { ReactionRepositoryImplMock } from "@domains/reaction";
import { UserDTO } from "@domains/user/dto";
import { UserRepositoryImplMock } from "@domains/user/repository";
import { ReactionType } from "@prisma/client";
import { CursorPagination } from "@types";

const commentRepository = new CommentRepositoryImplMock();
const followRepository = new FollowerRepositoryImplMock();
const userRepository = new UserRepositoryImplMock();
const reactionRepository = new ReactionRepositoryImplMock();
const s3client = new S3ServiceImplMock();

const options: CursorPagination = {
    limit: undefined,
    before: undefined,
    after: undefined
}

const commentService = new CommentServiceImpl(
    commentRepository,
    followRepository,
    userRepository,
    reactionRepository,
    s3client
);
const createPostData: any ={
    content: "Example content",
    images: ["test.jpg"]
}
const commentDto = new PostDTO({
    id:"CommentId",
    authorId:"OtherUserId",
    content: "Example two: content",
    images: ["CommentPicture.jpg"],
    createdAt: new Date(),
})
const extendedCommentDto = new ExtendedPostDTO({
    ...commentDto,
    author: {
        id: "OtherUserId",
        biography: null,
        createdAt: new Date(),
        image: "UserPicture.jpg",
        name: null,
        username: "Username"
    },
    qtyComments: 10,
    qtyLikes: 20,
    qtyRetweets: 5
});
const otherUserDto = new UserDTO({
    id: "OtherUserId",
    biography: null,
    createdAt: new Date(),
    image: "UserPicture.jpg",
    name: null,
    username: "Username"
},)
const postDto = new PostDTO({
    id:"PostId",
    authorId:"UserId",
    content: "Example one: content",
    images: ["test.jpg"],
    createdAt: new Date(),
})
describe("CommentServiceImpl",()=>{
    beforeEach(() => {
        jest.clearAllMocks();
    });
      
    test("", async()=>{
        
    })
    test("createComment_sucess",async ()=>{
        s3client.PutObjectFromS3.mockResolvedValue("LinkOfPicture")
        commentRepository.create.mockResolvedValue(commentDto)
        const post = await commentService.createComment("OtherUserId",createPostData,"PostId")

        expect(commentRepository.create).toHaveBeenCalledWith("OtherUserId",createPostData,"PostId");
        expect(s3client.PutObjectFromS3).toHaveBeenCalledTimes(1);
        expect(post).not.toBeNull();
        expect(post).toEqual(commentDto);
    })
    test("deleteComment_success", async()=>{
        commentRepository.getById.mockResolvedValue(postDto)
        await commentService.deleteComment("UserId","PostId")

        expect(commentRepository.getById).toHaveBeenCalledWith("PostId")
        expect(commentRepository.delete).toHaveBeenCalled();
    })
    test("deleteComment_NotFoundException_error", async()=>{
        commentRepository.getById.mockResolvedValue(null)
        await expect(commentService.deleteComment("OtherUserId","PostId")).rejects.toThrow()
        expect(commentRepository.getById).toHaveBeenCalledWith("PostId")
    })
    test("deleteComment_AuthorForbidden_error", async()=>{
        commentRepository.getById.mockResolvedValue(postDto)
        await expect(commentService.deleteComment("OtherUserId","PostId")).rejects.toThrow()
        expect(commentRepository.getById).toHaveBeenCalledWith("PostId")
    })
    test("getLatestComments_success", async()=>{
        commentRepository.getAllById.mockResolvedValue([commentDto])
        commentRepository.getCountByPostId.mockResolvedValue(1)
        reactionRepository.getCountByPostId.mockResolvedValue(2).mockResolvedValueOnce(4)
        userRepository.getById.mockResolvedValue(otherUserDto)
        s3client.GetObjectFromS3.mockResolvedValue("LinkOfPicture")

        const comment = await commentService.getLatestComments(otherUserDto.id, options)
        
        expect(commentRepository.getAllById).toHaveBeenCalledWith(otherUserDto.id, options);
        expect(userRepository.getById).toHaveBeenCalledWith(commentDto.authorId);
        expect(commentRepository.getCountByPostId).toHaveBeenCalledWith(commentDto.id);
        expect(reactionRepository.getCountByPostId).toHaveBeenNthCalledWith(1, commentDto.id, ReactionType.Like);
        expect(reactionRepository.getCountByPostId).toHaveBeenNthCalledWith(2, commentDto.id, ReactionType.Retweet);
        expect(s3client.GetObjectFromS3).toHaveBeenCalledTimes(2);
        expect(comment).not.toBeNull();
    })
    test("getCommentsByPostId_success", async()=>{
        commentRepository.getAllByPostId.mockResolvedValue([commentDto])
        commentRepository.getCountByPostId.mockResolvedValue(1)
        reactionRepository.getCountByPostId.mockResolvedValue(2).mockResolvedValueOnce(4)
        userRepository.getById.mockResolvedValue(otherUserDto)
        s3client.GetObjectFromS3.mockResolvedValue("LinkOfPicture")

        const comment = await commentService.getCommentsByPostId(postDto.id, options)
        
        expect(commentRepository.getAllByPostId).toHaveBeenCalledWith(postDto.id, options);
        expect(userRepository.getById).toHaveBeenCalledWith(commentDto.authorId);
        expect(commentRepository.getCountByPostId).toHaveBeenCalledWith(commentDto.id);
        expect(reactionRepository.getCountByPostId).toHaveBeenNthCalledWith(1, commentDto.id, ReactionType.Like);
        expect(reactionRepository.getCountByPostId).toHaveBeenNthCalledWith(2, commentDto.id, ReactionType.Retweet);
        expect(s3client.GetObjectFromS3).toHaveBeenCalledTimes(2);
        expect(comment).not.toBeNull();
    })

})