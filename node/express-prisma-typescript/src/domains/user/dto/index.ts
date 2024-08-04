import { ExtendedPostDTO } from "@domains/post/dto"
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator"

export class UserDTO {
  constructor (user: UserDTO) {
    this.id = user.id
    this.name = user.name
    this.createdAt = user.createdAt
    this.username = user.username
    this.image = user.image
    this.biography = user.biography;
    this.isPrivate = user.isPrivate;
  }

  id: string
  username!: string
  name: string | null
  image: string | null;
  biography: string | null;
  createdAt: Date
  isPrivate:boolean
}

export class ExtendedUserDTO extends UserDTO {
  constructor (user: ExtendedUserDTO) {
    super(user)
    this.email = user.email
    this.password = user.password
  }

  email!: string
  
  password!: string
}
export class UserViewDTO {//AuthorDTO en front
  constructor (user: UserViewDTO) {
    this.id = user.id
    this.name = user.name
    this.username = user.username
    this.createdAt = user.createdAt
    this.image = user.image
    this.isPrivate = user.isPrivate
  }

  id: string
  name: string | null
  username: string
  image: string | null
  createdAt: Date
  isPrivate:boolean
}
export class ExtendedUserViewDTO extends UserViewDTO{//UserDTO en front
  constructor (user: ExtendedUserViewDTO) {
    super(user)
    this.followers = user.followers;
    this.following = user.following;
    this.posts = user.posts;
  }
  followers: UserViewDTO[];
  following: UserViewDTO[];
  posts:ExtendedPostDTO[];
}
export class UpdateUserInputDTO {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
    name?: string

  @IsOptional()
  @IsString()
  @IsNotEmpty()
    image?: string
    
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(240)
    biography?: string
}

