import { SignupInputDTO } from '@domains/auth/dto'
import { PrismaClient } from '@prisma/client'
import { OffsetPagination } from '@types'
import { ExtendedUserDTO, UpdateUserInputDTO, UserDTO } from '../dto'
import { UserRepository } from './user.repository'

export class UserRepositoryImpl implements UserRepository {
  constructor (private readonly db: PrismaClient) {}
  
  async create (data: SignupInputDTO): Promise<UserDTO> {   
 
    const user = await this.db.user.create({
      data:{
        ...data,
        name: data.username
      }
    })

    return new UserDTO(user);
  }
  async update(userId: string,data: UpdateUserInputDTO): Promise<UserDTO>{
    return await this.db.user.update({
      where:{
        id: userId
      },
      data:{
        ...data
      }
    }).then(user => new UserDTO(user))
  }

  async getById (userId: any): Promise<UserDTO | null> {
    const user = await this.db.user.findUnique({
      where: {
        id: userId
      }
    })
    return user ? new UserDTO(user) : null
  }
  async getPrivacyById(userId: string): Promise<boolean | null>{
    const user = await this.db.user.findUnique({
      where: {
        id: userId
        
      }
    })

    return (user) ? user.isPrivate : null;
  }

  async delete (userId: any): Promise<void> {
    await this.db.user.delete({
      where: {
        id: userId
      }
    })
  }

  async getRecommendedUsersPaginated (options: OffsetPagination): Promise<UserDTO[]> {
    const users = await this.db.user.findMany({
      take: options.limit ? options.limit : undefined,
      skip: options.skip ? options.skip : undefined,
      orderBy: [
        {
          id: 'asc'
        }
      ]
    })
    return users.map(user => new UserDTO(user))
  }

  async getByEmailOrUsername (email?: string, username?: string): Promise<ExtendedUserDTO | null> {
    const user = await this.db.user.findFirst({
      where: {
        OR: [
          {
            email
          },
          {
            username
          }
        ]
      }
    })
    return user ? new ExtendedUserDTO(user) : null
  }
  async getAllByUsernamePaginated(username: string, options: OffsetPagination): Promise<UserDTO[]> {
    const users = await this.db.user.findMany({
      where: {
        username: {
          contains: username,
          mode:'insensitive'
        }
      },
      take:options.limit ? options.limit : undefined,
      skip:options.skip ? options.skip : undefined,
      orderBy: {
        createdAt: 'desc'
      }
    })
    return users;
  }

}
