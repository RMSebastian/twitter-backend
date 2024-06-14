import { OffsetPagination } from '@types'
import { ExtendedUserViewDTO, UpdateUserInputDTO, UserDTO, UserViewDTO } from '../dto'

export interface UserService {
  deleteUser: (userId: any) => Promise<void>
  updateUser(userId: string, data: UpdateUserInputDTO): Promise<UserDTO> 
  getUser: (userId: string,otherUserId: string) => Promise<ExtendedUserViewDTO>
  getUserRecommendations: (userId: any, options: OffsetPagination) => Promise<UserViewDTO[]>
  getUsersByUsername(username: string, options: OffsetPagination): Promise<UserViewDTO[]>
}
