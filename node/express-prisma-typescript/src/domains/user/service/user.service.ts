import { OffsetPagination } from '@types'
import { UpdateUserInputDTO, UserDTO } from '../dto'

export interface UserService {
  deleteUser: (userId: any) => Promise<void>
  updateUser(userId: string, data: UpdateUserInputDTO): Promise<UserDTO> 
  getUser: (userId: any) => Promise<UserDTO>
  getUserRecommendations: (userId: any, options: OffsetPagination) => Promise<UserDTO[]>
}
