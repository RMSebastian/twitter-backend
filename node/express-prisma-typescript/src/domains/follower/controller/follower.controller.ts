import { Request, Response, Router } from "express";

import 'express-async-errors'
import { FollowerService, FollowerServiceImpl } from "../service";
import { FollowerRepositoryImpl } from "../repository";
import { db } from "@utils";
import httpStatus from "http-status";

export const followerRouter = Router();

//Dependency injection
const service: FollowerService = new FollowerServiceImpl(new FollowerRepositoryImpl(db))

/**
 * @swagger
 * tags:
 *     name: follower
 *     description: follower endpoints 
 * /api/follower/follow/{userId}:
 *   post:
 *     security:
 *         - BearerAuth: []
 *     summary: Follow a user
 *     description: Follow another user.
 *     tags: [follower]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id
 *     responses:
 *       2XX:
 *         description: User followed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "User followed successfully"
 *       4XX:
 *         description: Error with the request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
followerRouter.post("/follow/:userId",async (req: Request,res: Response)=>{
    
    const{userId} = res.locals.context; // get this user (follower)
    const{userId: otherUserId} = req.params;

    const follow = await service.follow(userId,otherUserId);
    
    return res.status(httpStatus.CREATED).json(follow);
});
/**
 * @swagger
 * /api/follower/unfollow/{userId}:
 *   post:
 *     security:
 *         - BearerAuth: []
 *     summary: Unfollow a user
 *     description: Unfollow another user.
 *     tags: [follower]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id
 *     responses:
 *       2XX:
 *         description: User unfollowed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "User unfollowed successfully"
 *       4XX:
 *         description: Error with the request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
followerRouter.post("/unfollow/:userId", async(req: Request, res: Response)=>{

    const{userId} = res.locals.context; // get this user (follower)
    const{userId: otherUserId} = req.params;

    const follow = await service.unfollow(userId,otherUserId);
    
    return res.status(httpStatus.CREATED).json(follow);
})
/**
 * @swagger
 * components:
 *  schemas:
 *    FollowDTO:
 *      type: object
 *      required:
 *        - followerId
 *        - followedId
 *      properties:
 *        followerId:
 *          type: string
 *          description: User's follower id
 *        followedId:
 *          type: string
 *          description: User's followed id
 *      tags: [follower]
 */
/**
 * 
 *    CreatePostInputDTO:
 *      type: object
 *      required:
 *        - content
 *        - images
 *      properties:
 *        content:
 *          type: string
 *          description: Post content
 *        images:
 *          type: array
 *          description: Post images
 *          items:
 *            type: string
 *      tags: [post] 
 */
