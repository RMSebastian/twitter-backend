import { FollowerRepositoryImplMock } from "@domains/follower";
import { FollowDTO } from "@domains/follower/dto";
import { FollowerServiceImpl } from "@domains/follower/service";

const followerRepository = new FollowerRepositoryImplMock();
const followerService = new FollowerServiceImpl(followerRepository);

const followDto = new FollowDTO({
    id: "FollowId",
    followedId:"OtherUserId",
    followerId:"UserId"
})

describe("FollowerServiceImpl", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("follow_success", async () => {
        followerRepository.getFollowId.mockResolvedValue(undefined);
        followerRepository.create.mockResolvedValue(followDto)

        const follow = await followerService.follow(followDto.followerId, followDto.followedId);

        expect(followerRepository.getFollowId).toHaveBeenCalledWith(followDto.followerId, followDto.followedId);
        expect(followerRepository.create).toHaveBeenCalledWith(followDto.followerId, followDto.followedId);
        expect(follow).toBeDefined();
        expect(follow.followerId).toBe(followDto.followerId);
        expect(follow.followedId).toBe(followDto.followedId);
    });

    test("follow_conflict", async () => {
        followerRepository.getFollowId.mockResolvedValue(followDto);

        await expect(followerService.follow(followDto.followerId, followDto.followedId)).rejects.toThrow();
        expect(followerRepository.getFollowId).toHaveBeenCalledWith(followDto.followerId, followDto.followedId);
        expect(followerRepository.create).not.toHaveBeenCalled();
    });

    test("unfollow_success", async () => {

        followerRepository.getFollowId.mockResolvedValue(followDto)
        followerRepository.delete.mockResolvedValue(undefined);

        await followerService.unfollow(followDto.followerId, followDto.followedId);

        expect(followerRepository.getFollowId).toHaveBeenCalledWith(followDto.followerId, followDto.followedId);
        expect(followerRepository.delete).toHaveBeenCalledWith(followDto.id);
    });

    test("unfollow_notfound", async () => {
        followerRepository.getFollowId.mockResolvedValue(undefined);

        await expect(followerService.unfollow(followDto.followerId, followDto.followedId)).rejects.toThrow();
        expect(followerRepository.getFollowId).toHaveBeenCalledWith(followDto.followerId, followDto.followedId);
        expect(followerRepository.delete).not.toHaveBeenCalled();
    });
});