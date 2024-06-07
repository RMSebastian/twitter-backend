import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors'

import { db, BodyValidation, ActionValidation } from '@utils'
import { CreateReactionInputDTO } from '../dto';
import { ReactionService, ReactionServiceImpl } from '../service';
import { ReactionRepositoryImpl } from '../repository';
import { ReactionType } from '@prisma/client';

export const reactionRouter = Router();

const service: ReactionService = new ReactionServiceImpl(new ReactionRepositoryImpl(db))

/**
 * @swagger
 * tags:
 *  name: reaction
 *  description: reaction endpoints
 * /api/reaction/{postId}:
 *   post:
 *     security:
 *         - apiKey: []
 *     summary: Add a reaction to a post by postId
 *     tags: [reaction]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReactionInputDTO'
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: The post id
 *     responses:
 *       2XX:
 *         description: Reaction created on post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReactionDTO'
 *       4XX:
 *         description: The reaction was not found
 */
reactionRouter.post("/:postId", BodyValidation(CreateReactionInputDTO),async (req: Request, res: Response)=>{
    const { userId } = res.locals.context;
    const { postId } = req.params;
    const data = req.body;
  
    const reaction = await service.createReaction(userId,postId,data);

    return res.status(HttpStatus.CREATED).json(reaction)
});
/**
 * @swagger
 * /api/reaction/{postId}:
 *   delete:
 *     security:
 *         - apiKey: []
 *     summary: Remove the reaction from post by postId
 *     tags: [reaction]
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: The post id
 *     responses:
 *       2XX:
 *         description: The reaction was deleted
 *       4XX:
 *         description: The reaction was not found
 */
reactionRouter.delete("/:postId", BodyValidation(CreateReactionInputDTO),async (req: Request, res: Response)=>{
    const { userId } = res.locals.context;
    const { postId } = req.params;
    const data = req.body;
  
    await service.deleteReaction(userId,postId,data);

    return res.status(HttpStatus.OK).send(`Deleted reaction ${postId}`)
});
/**
 * @swagger
 * /api/reaction/{action}/{userId}:
 *   get:
 *     security:
 *         - apiKey: []
 *     summary: Look for post with certain reactions
 *     tags: [reaction]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id
 *       - in: path
 *         name: action
 *         schema:
 *           type: string
 *         required: true
 *         description: The action to gain
 *     responses:
 *       2XX:
 *         description: Got posts by action selected
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PostDTO'
 *       4XX:
 *         description: Error with the request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
reactionRouter.get('/:action/:userId',ActionValidation, async (req: Request, res: Response) => {
    const { userId } = res.locals.context
    const { userId: authorId, action } = req.params
  
    const posts = await service.getReactionsWithFilter(userId,action as ReactionType)
  
    return res.status(HttpStatus.OK).json(posts)
  })
/**
 * @swagger
 * components:
 *  schemas:
 *    ReactionType:
 *      type: string
 *      enum:
 *        - Like
 *        - Retweet
 *      description: Enum representing the type of reaction
 */
/**
 * @swagger
 * components:
 *  schemas:
 *    CreateReactionInputDTO:
 *      type: object
 *      required:
 *        - type
 *      properties:
 *        type:
 *          $ref: '#/components/schemas/ReactionType'
 *          description: The type of reaction
 *      tags: [reaction]
 */
/**
 * @swagger
 * components:
 *  schemas:
 *    ReactionDTO:
 *      type: object
 *      required:
 *        - userId
 *        - postId
 *        - type
 *      properties:
 *        userId:
 *          type: string
 *          description: User ID
 *        postId:
 *          type: string
 *          description: Post ID
 *        type:
 *          $ref: '#/components/schemas/ReactionType'
 *          description: The type of reaction
 *      tags: [reaction]
 */