import { CreatePostInputDTO, ExtendedPostDTO } from "@domains/post/dto"
import { CursorPagination } from "@types"

export interface CommentRepository{
    create(userId: string, data: CreatePostInputDTO): Promise<ExtendedPostDTO>
    delete(postId: string): Promise<void>
    getById(postId: string): Promise<ExtendedPostDTO | null>
    getAllById(userId: string,options: CursorPagination): Promise<ExtendedPostDTO[]>
    getAllByPostId(postId: string, options: CursorPagination): Promise<ExtendedPostDTO[]>
}