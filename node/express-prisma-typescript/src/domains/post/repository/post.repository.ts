import { CursorPagination } from '@types'
import { CreatePostInputDTO, ExtendedPostDTO } from '../dto'

export interface PostRepository {
  create: (userId: string, data: CreatePostInputDTO) => Promise<ExtendedPostDTO>
  getAllByDatePaginated: (filter: string[],options: CursorPagination) => Promise<ExtendedPostDTO[]>
  delete: (postId: string) => Promise<void>
  getById: (postId: string) => Promise<ExtendedPostDTO | null>
  getByAuthorId: (authorId: string) => Promise<ExtendedPostDTO[]>
}
