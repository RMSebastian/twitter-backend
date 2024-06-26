import { NotFoundException } from '@utils/errors'
import { OffsetPagination } from 'types'
import { ExtendedUserViewDTO, UpdateUserInputDTO, UserDTO, UserViewDTO } from '../dto'
import { UserRepository } from '../repository'
import { UserService } from './user.service'
import { FollowerRepository } from '@domains/follower'
import { S3Service } from '@aws/service'

export class UserServiceImpl implements UserService {
  constructor (
    private readonly userRepository: UserRepository,
    private readonly followRepository: FollowerRepository,
    private readonly s3Client: S3Service
  ) {}

  async getUser (userId: string,otherUserId: string) : Promise<ExtendedUserViewDTO> {
    const user = await this.userRepository.getById(otherUserId)
    if (!user) throw new NotFoundException('user')
    const bool = await (async ()=>{
      if(userId == otherUserId) return undefined;  
      else return (await this.followRepository.getFollowId(userId,otherUserId) != null)?true:false;
    })();
    const userWithUrl = await this.getUrl(user);
    const userView = new UserViewDTO(userWithUrl);
    const extendedUser = new ExtendedUserViewDTO(userView);
    extendedUser.follow = bool
    return extendedUser;
  }
  async updateUser(userId: string, data: UpdateUserInputDTO): Promise<UserDTO>{
    if(data.image)data.image = `user/${userId}/${Date.now()}/${data.image}`; //
    const user = await this.userRepository.update(userId,data);
    if (!user) throw new NotFoundException('user');
    const userWithUrl = await this.putUrl(user);
    return userWithUrl;
  }

  async getUserRecommendations (userId: any, options: OffsetPagination): Promise<UserViewDTO[]> {
    // TODO: make this return only users followed by users the original user follows
    const users = await this.userRepository.getRecommendedUsersPaginated(options);
    const userWithUrl = await this.getUrlsArray(users);
    return userWithUrl.map(user => new UserViewDTO(user))
  }
  async getUsersByUsername(username: string, options: OffsetPagination): Promise<UserViewDTO[]>{
    const users = await this.userRepository.getAllByUsernamePaginated(username,options)
    const userWithUrl = await this.getUrlsArray(users);
    return userWithUrl.map(user => new UserViewDTO(user))
  }

  async deleteUser (userId: any): Promise<void> {
    await this.userRepository.delete(userId)
  }

  private async putUrl(user: UserDTO): Promise<UserDTO>{
    if(user.image != null){
      const url = await this.s3Client.PutObjectFromS3(user.image);
      if(!url)throw new NotFoundException('url')
      user.image = url;
    }
    return user;
  }
  private async getUrl(user: UserDTO): Promise<UserDTO>{
    if(user.image != null){
      const url = await this.s3Client.GetObjectFromS3(user.image);
      if(!url)throw new NotFoundException('url')
      user.image = url;
    }
    return user;
  }
  private async getUrlsArray(users: UserDTO[]): Promise<UserDTO[]>{
    for (const user of users) { 
      if(user.image != null){
        const url = await this.s3Client.GetObjectFromS3(user.image);
        if(!url)throw new NotFoundException('url')
        user.image = url;
      }
    }
    return users;
  }
}
