import { ReactionRepositoryImplMock } from "@domains/reaction";
import { ReactionDTO } from "@domains/reaction/dto";
import { ReactionServiceImpl } from "@domains/reaction/service";
import { ReactionType } from "@prisma/client";

const reactionRepository = new ReactionRepositoryImplMock();
const reactionService = new ReactionServiceImpl(reactionRepository);

const userId = "UserId";
const postId = "PostId";

const reactionDTORetweet = new ReactionDTO({
    id: "retweetId",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "UserId",
    postId: "PostId",
    type: ReactionType.RETWEET
});
const reactionDTOLike = new ReactionDTO({
    id: "likeId",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "UserId",
    postId: "PostId",
    type: ReactionType.LIKE
});
const createReactionLike = {
    type: ReactionType.LIKE
};
const createReactionRetweet = {
    type: ReactionType.RETWEET
};

describe("ReactionServiceImpl", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("createReaction_success", async () => {
        reactionRepository.getReactionId.mockResolvedValue(undefined);
        reactionRepository.create.mockResolvedValue(reactionDTOLike);

        const reaction = await reactionService.createReaction(userId, postId, createReactionLike);

        expect(reactionRepository.getReactionId).toHaveBeenCalledWith(userId, postId, createReactionLike);
        expect(reactionRepository.create).toHaveBeenCalledWith(userId, postId, createReactionLike);
        expect(reaction).toEqual(reactionDTOLike);
    });

    test("createReaction_conflict", async () => {
        reactionRepository.getReactionId.mockResolvedValue(reactionDTOLike);

        await expect(reactionService.createReaction(userId, postId, createReactionLike)).rejects.toThrow();
        expect(reactionRepository.getReactionId).toHaveBeenCalledWith(userId, postId, createReactionLike);
        expect(reactionRepository.create).not.toHaveBeenCalled();
    });

    test("deleteReaction_success", async () => {
        reactionRepository.getReactionById.mockResolvedValue(reactionDTOLike);
        reactionRepository.delete.mockResolvedValue(undefined);

        await reactionService.deleteReaction(reactionDTOLike.id);

        expect(reactionRepository.getReactionById).toHaveBeenCalledWith(reactionDTOLike.id);
        expect(reactionRepository.delete).toHaveBeenCalledWith(reactionDTOLike.id);
    });

    test("deleteReaction_not_found", async () => {
        reactionRepository.getReactionById.mockResolvedValue(undefined);

        await expect(reactionService.deleteReaction("nonexistentId")).rejects.toThrow();
        expect(reactionRepository.getReactionById).toHaveBeenCalledWith("nonexistentId");
        expect(reactionRepository.delete).not.toHaveBeenCalled();
    });

    test("getReactionsWithFilter_success", async () => {
        const filter = ReactionType.RETWEET;

        reactionRepository.getAllByUserId.mockResolvedValue([reactionDTORetweet]);

        const reactions = await reactionService.getReactionsWithFilter(userId, filter);

        expect(reactionRepository.getAllByUserId).toHaveBeenCalledWith(userId, filter);
        expect(reactions).toEqual([reactionDTORetweet]);
    });

    test("getReactionsWithFilter_no_filter_success", async () => {
        const filter = null;

        reactionRepository.getAllByUserId.mockResolvedValue([reactionDTOLike, reactionDTORetweet]);

        const reactions = await reactionService.getReactionsWithFilter(userId, filter);

        expect(reactionRepository.getAllByUserId).toHaveBeenCalledWith(userId, filter);
        expect(reactions).toEqual([reactionDTOLike, reactionDTORetweet]);
    });
});
