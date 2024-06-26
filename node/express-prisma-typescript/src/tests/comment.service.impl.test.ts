import { CommentRepositoryImplMock } from "@domains/comment/repository";
import { CommentServiceImpl } from "@domains/comment/service";
import { FollowerRepositoryImplMock } from "@domains/follower";
import { ExtendedPostDTO, PostDTO } from "@domains/post/dto";
import { ReactionRepositoryImplMock } from "@domains/reaction";
import { UserRepositoryImplMock } from "@domains/user/repository";
import { CursorPagination } from "@types";
import { GetObjectFromS3 } from "@utils/s3.aws";

const commentRepository = new CommentRepositoryImplMock();
const followRepository = new FollowerRepositoryImplMock();
const userRepository = new UserRepositoryImplMock();
const reactionRepository = new ReactionRepositoryImplMock();

const options: CursorPagination = {
    limit: undefined,
    before: undefined,
    after: undefined
}

const commentService = new CommentServiceImpl(
    commentRepository,
    followRepository,
    userRepository,
    reactionRepository
);
const createPostData: any ={
    content: "Example content",
    images: ["test.jpg"]
}
const commentDto = new PostDTO({
    id:"CommentId",
    authorId:"OtherUserId",
    content: "Example two: content",
    images: ["test.jpg"],
    createdAt: new Date(),
})
const extendedCommentDto = new ExtendedPostDTO({
    ...commentDto,
    author: {
        id: "OtherUserId",
        biography: null,
        createdAt: new Date(),
        image: null,
        name: null,
        username: "Username"
    },
    qtyComments: 10,
    qtyLikes: 20,
    qtyRetweets: 5
  });
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
        jest.spyOn(commentService,'putUrl').mockResolvedValue(commentDto)
        commentRepository.create.mockResolvedValue(commentDto)
        const post = await commentService.createComment("OtherUserId",createPostData,"PostId")

        expect(commentRepository.create).toHaveBeenCalledWith("OtherUserId",createPostData,"PostId");
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
        jest.spyOn(commentService, 'getUrlsArray').mockResolvedValue([commentDto])
        jest.spyOn(commentService, 'ExtendPosts').mockResolvedValue([extendedCommentDto])
        const comment = await commentService.getLatestComments("OtherUserId", options)
        expect(comment).not.toBeNull();
    })

})