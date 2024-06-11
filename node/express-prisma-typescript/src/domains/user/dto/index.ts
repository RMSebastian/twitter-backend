import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator"

export class UserDTO {
  constructor (user: UserDTO) {
    this.id = user.id
    this.name = user.name
    this.createdAt = user.createdAt
    this.image = user.image
  }

  id: string
  name: string | null
  image: string | null;
  createdAt: Date
}

export class ExtendedUserDTO extends UserDTO {
  constructor (user: ExtendedUserDTO) {
    super(user)
    this.email = user.email
    this.name = user.name
    this.password = user.password
  }

  email!: string
  username!: string
  password!: string
}
export class UserViewDTO {
  constructor (user: UserViewDTO) {
    this.id = user.id
    this.name = user.name
    this.username = user.username
    this.profilePicture = user.profilePicture
  }

  id: string
  name: string
  username: string
  profilePicture: string | null
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
    biografy?: string
}

