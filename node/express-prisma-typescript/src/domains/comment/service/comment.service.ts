import { CreatePostInputDTO, ExtendedPostDTO } from "@domains/post/dto"
import { CursorPagination } from "@types"

export interface CommentService{
    createComment(userId: string, data: CreatePostInputDTO): Promise<ExtendedPostDTO>
    deleteComment (userId: string, postId: string): Promise<void> 
    getLatestComments(userId: string,options: CursorPagination): Promise<ExtendedPostDTO[]>
    getCommentsByPostId(postId: string, options: CursorPagination): Promise<ExtendedPostDTO[]>
}