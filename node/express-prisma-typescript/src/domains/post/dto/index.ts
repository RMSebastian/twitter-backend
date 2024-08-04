import { ArrayMaxSize, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { UserDTO, UserViewDTO } from '@domains/user/dto'
import { ReactionDTO } from '@domains/reaction/dto';

export class CreatePostInputDTO {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  parentId?: string | null;
  @IsString()
  @IsNotEmpty()
  @MaxLength(240)
    content!: string

  @IsOptional()
  @ArrayMaxSize(4)
    images?: string[]
}

export class PostDTO {
  constructor (post: PostDTO) {
    this.id = post.id
    this.authorId = post.authorId
    this.content = post.content
    this.images = post.images
    this.createdAt = post.createdAt
    this.parentId = post.parentId
  }

  id: string
  parentId: string | null
  authorId: string
  content: string
  images: string[]
  createdAt: Date
}

export class ExtendedPostDTO extends PostDTO {
  constructor (post: ExtendedPostDTO) {
    super(post)
    this.author = post.author
    this.reactions = post.reactions
    this.comments = post.comments
  }

  author!: UserViewDTO
  reactions!: ReactionDTO[]
  comments!: ExtendedPostDTO[]
}
