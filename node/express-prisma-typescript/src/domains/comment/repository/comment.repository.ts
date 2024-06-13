import { CreatePostInputDTO, PostDTO } from "@domains/post/dto"
import { CursorPagination } from "@types"

export interface CommentRepository{
    create(userId: string, data: CreatePostInputDTO, postId: string | null): Promise<PostDTO>
    delete(postId: string): Promise<void>
    getById(postId: string): Promise<PostDTO | null>
    getAllById(userId: string,options: CursorPagination): Promise<PostDTO[]>
    getAllByPostId(postId: string, options: CursorPagination): Promise<PostDTO[]>
    getCountByPostId(postId: string): Promise<number>
}