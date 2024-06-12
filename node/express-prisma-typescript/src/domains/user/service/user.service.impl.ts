import { NotFoundException } from '@utils/errors'
import { OffsetPagination } from 'types'
import { UpdateUserInputDTO, UserDTO, UserViewDTO } from '../dto'
import { UserRepository } from '../repository'
import { UserService } from './user.service'
import { GetObjectFromS3, PutObjectFromS3 } from '@utils/s3.aws'

export class UserServiceImpl implements UserService {
  constructor (private readonly repository: UserRepository) {}

  async getUser (userId: any): Promise<UserViewDTO> {
    const user = await this.repository.getById(userId)
    if (!user) throw new NotFoundException('user')
    const userWithUrl = await this.getUrl(user);
    return new UserViewDTO(userWithUrl);
  }
  async updateUser(userId: string, data: UpdateUserInputDTO): Promise<UserDTO>{
    if(data.image)data.image = `user/${userId}/${Date.now()}/${data.image}`; //
    const user = await this.repository.update(userId,data);
    if (!user) throw new NotFoundException('user');
    const userWithUrl = await this.putUrl(user);
    return userWithUrl;
  }

  async getUserRecommendations (userId: any, options: OffsetPagination): Promise<UserViewDTO[]> {
    // TODO: make this return only users followed by users the original user follows
    const users = await this.repository.getRecommendedUsersPaginated(options);
    const userWithUrl = await this.getUrlsArray(users);
    return userWithUrl.map(user => new UserViewDTO(user))
  }

  async deleteUser (userId: any): Promise<void> {
    await this.repository.delete(userId)
  }

  private async putUrl(user: UserDTO): Promise<UserDTO>{
    if(user.image != null){
      const url = await PutObjectFromS3(user.image);
      if(!url)throw new NotFoundException('url')
      user.image = url;
    }
    return user;
  }
  private async getUrl(user: UserDTO): Promise<UserDTO>{
    if(user.image != null){
      const url = await GetObjectFromS3(user.image);
      if(!url)throw new NotFoundException('url')
      user.image = url;
    }
    return user;
  }
  private async getUrlsArray(users: UserDTO[]): Promise<UserDTO[]>{
    for (const user of users) { 
      if(user.image != null){
        const url = await GetObjectFromS3(user.image);
        if(!url)throw new NotFoundException('url')
        user.image = url;
      }
    }
    return users;
  }
}
