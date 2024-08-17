import { PrismaClient, User } from '@prisma/client';
import { FollowerRepository } from '.';
import { FollowDTO } from '../dto';
import { UserDTO, UserViewDTO } from '@domains/user/dto';

export class FollowerRepositoryImpl implements FollowerRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(followerId: string, followedId: string): Promise<UserViewDTO> {
    const follow = await this.db.follow.create({
      data: {
        followerId: followerId,
        followedId: followedId,
      },
      include: {
        followed: true,
      },
    });

    return new UserViewDTO(follow.followed);
  }
  async delete(followId: string): Promise<void> {
    await this.db.follow.delete({
      where: {
        id: followId,
      },
    });
  }
  async getFollowId(followerId: string, followedId: string): Promise<FollowDTO | null> {
    const follow = await this.db.follow.findFirst({
      where: {
        followerId: followerId,
        followedId: followedId,
      },
    });
    return follow ? new FollowDTO(follow) : null;
  }
  async getFollowedIds(followerId: string): Promise<string[]> {
    const follows = await this.db.follow.findMany({
      where: {
        followerId: followerId,
      },
    });
    return follows.map((follow) => follow.followedId);
  }
  async getFollowedUsers(followerId: string): Promise<UserDTO[]> {
    const follows = await this.db.follow.findMany({
      where: {
        followerId: followerId,
      },
      include: {
        followed: true,
      },
    });
    return follows.map((follow) => follow.followed);
  }
  async getFollowerIds(followedId: string): Promise<string[]> {
    const follows = await this.db.follow.findMany({
      where: {
        followedId: followedId,
      },
    });
    return follows.map((follow) => follow.followerId);
  }
  async getFollowerUsers(followedId: string): Promise<UserDTO[]> {
    const follows = await this.db.follow.findMany({
      where: {
        followedId: followedId,
      },
      include: {
        follower: true,
      },
    });
    return follows.map((follow) => follow.follower);
  }
  async getRelationshipOfUsers(userId: string, otherUserId: string): Promise<boolean> {
    const follower = await this.db.follow.findMany({
      where: {
        OR: [
          {
            AND: {
              followedId: userId,
              followerId: otherUserId,
            },
          },
          {
            AND: {
              followedId: otherUserId,
              followerId: userId,
            },
          },
        ],
      },
    });
    return follower.length == 2 ? true : false;
  }
  async getRelationshipsByUserId(followerId: string): Promise<UserViewDTO[]> {
    const follower = await this.db.follow.findMany({
      where: {
        followerId: followerId,
      },
      include: {
        followed: true,
      },
    });
    const followed = await this.db.follow.findMany({
      where: {
        followedId: followerId,
      },
    });
    let users: User[] = [];

    follower.forEach((fer) => {
      followed.forEach((fed) => {
        if (fer.followedId == fed.followerId) {
          users.push(fer.followed);
          return;
        }
      });
    });

    return users.map((user) => new UserViewDTO(user));
  }
}
