import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors'
import { CommentService, CommentServiceImpl } from '../service';
import { BodyValidation, db } from '@utils';
import { FollowerRepositoryImpl } from '@domains/follower';
import { UserRepositoryImpl } from '@domains/user/repository';
import { CreatePostInputDTO } from '@domains/post/dto';
import { CommentRepositoryImpl } from '../repository';

export const commentRouter = Router();

const service: CommentService = new CommentServiceImpl(
    new CommentRepositoryImpl(db), new FollowerRepositoryImpl(db), new UserRepositoryImpl(db)
);
/**
 * @swagger
 * /api/comment/me:
 *   get:
 *     security:
 *         - apiKey: []
 *     summary: Get comments by user id
 *     description: Retrieve comments created by a specific user.
 *     tags: [comment]
 *     responses:
 *       2XX:
 *         description: A list of comment created by the specified user.
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
  commentRouter.get('/me', async (req: Request, res: Response) => {
    const { userId } = res.locals.context
    
    const { limit, before, after } = req.query as Record<string, string>
    
    const posts = await service.getLatestComments(userId, {limit: Number(limit),before,after})
  
    return res.status(HttpStatus.OK).json(posts)
  })
/**
 * @swagger
 * tags:
 *  name: comment
 *  description: comment endpoints
 * /api/comment/by_post/{postId}:
 *   get:
 *     security:
 *         - apiKey: []
 *     summary: Get comments by post id
 *     tags: [comment]
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: The post id
 *     responses:
 *       2XX:
 *         description: Got comments by post id
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
commentRouter.get('/by_post/:postId', async (req: Request, res: Response) => {
    const { postId } = req.params
  
    const comments = await service.getCommentsByPostId(postId)
  
    return res.status(HttpStatus.OK).json(comments)
  })

/**
 * @swagger
 * /api/comment/by_user/{userId}:
 *   get:
 *     security:
 *         - apiKey: []
 *     summary: Get comments by user id
 *     description: Retrieve comments created by a specific user.
 *     tags: [comment]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user whose comment are to be retrieved.
 *     responses:
 *       2XX:
 *         description: A list of comment created by the specified user.
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
commentRouter.get('/by_user/:userId', async (req: Request, res: Response) => {
    const { userId } = req.params
    
    const { limit, before, after } = req.query as Record<string, string>
    
    const posts = await service.getLatestComments(userId, {limit: Number(limit),before,after})
  
    return res.status(HttpStatus.OK).json(posts)
  })
/**
 * @swagger
 * /api/comment/{postId}:
 *   post:
 *     security:
 *         - apiKey: []
 *     summary: Create a comment
 *     tags: [comment]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePostInputDTO'
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: The post id
 *     responses:
 *       2XX:
 *         description: Comment created
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
commentRouter.post('/:postId',BodyValidation(CreatePostInputDTO), async (req: Request, res: Response) => {
    const { userId } = res.locals.context
    const { postId } = req.params
    const data = req.body
  
    const comment = await service.createComment(userId, data ,postId);
  
    return res.status(HttpStatus.OK).json(comment)
})
/**
 * @swagger
 * /api/comment/{postId}:
 *   delete:
 *     security:
 *         - apiKey: []
 *     summary: Remove the comment by id
 *     tags: [comment]
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: The post id
 *     responses:
 *       2XX:
 *         description: The comment was deleted
 *       4XX:
 *         description: The comment was not found
 */
commentRouter.delete('/:postId', async (req: Request, res: Response) => {
    const { userId } = res.locals.context
    const { postId } = req.params
  
    await service.deleteComment(userId, postId)
  
    return res.status(HttpStatus.OK).send(`Deleted post ${postId}`)
})

