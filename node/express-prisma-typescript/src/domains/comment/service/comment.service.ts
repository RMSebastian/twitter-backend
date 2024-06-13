import { CreatePostInputDTO, PostDTO } from "@domains/post/dto"
import { CursorPagination } from "@types"

export interface CommentService{
    createComment(userId: string, data: CreatePostInputDTO, postId: string | null): Promise<PostDTO>
    deleteComment (userId: string, postId: string): Promise<void> 
    getLatestComments(userId: string,options: CursorPagination): Promise<PostDTO[]>
    getCommentsByPostId(postId: string, options: CursorPagination): Promise<PostDTO[]>
}