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
 * /follower/follow/{userId}:
 *   post:
 *     summary: Follow a user
 *     description: Follow another user.
 *     tags: [follower]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FollowInputDTO'
 *     responses:
 *       201:
 *         description: User followed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "User followed successfully"
 *       400:
 *         description: Error with the request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * /follower/unfollow/{userId}:
 *   delete:
 *     summary: Unfollow a user
 *     description: Unfollow another user.
 *     tags: [follower]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FollowInputDTO'
 *     responses:
 *       201:
 *         description: User unfollowed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "User unfollowed successfully"
 *       400:
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

followerRouter.delete("/unfollow/:userId", async(req: Request, res: Response)=>{

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
 *        - id
 *        - followerId
 *        - followedId
 *      properties:
 *        id:
 *          type: string
 *          description: User's id
 *        followerId:
 *          type: string
 *          description: User's follower id
 *        followedId:
 *          type: string
 *          description: User's followed id
 *      tags: [follower]
 */