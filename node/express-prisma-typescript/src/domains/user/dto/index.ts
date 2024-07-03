import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator"

export class UserDTO {
  constructor (user: UserDTO) {
    this.id = user.id
    this.name = user.name
    this.createdAt = user.createdAt
    this.username = user.username
    this.image = user.image
    this.biography = user.biography;
  }

  id: string
  username!: string
  name: string | null
  image: string | null;
  biography: string | null;
  createdAt: Date
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
export class UserViewDTO {
  constructor (user: UserViewDTO) {
    this.id = user.id
    this.name = user.name
    this.username = user.username
    this.image = user.image
  }

  id: string
  name: string | null
  username: string
  image: string | null
}
export class ExtendedUserViewDTO extends UserViewDTO{
  constructor (user: ExtendedUserViewDTO) {
    super(user)
    this.follow = user.follow;
  }
  follow: boolean | null;
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

