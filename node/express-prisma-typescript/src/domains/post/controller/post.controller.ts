import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors'

import { db, BodyValidation } from '@utils'

import { PostRepositoryImpl } from '../repository'
import { PostService, PostServiceImpl } from '../service'
import { CreatePostInputDTO } from '../dto'
import { UserRepositoryImpl } from '@domains/user/repository'
import { FollowerRepositoryImpl } from '@domains/follower/repository'

export const postRouter = Router()

// Use dependency injection
const service: PostService = new PostServiceImpl(
new PostRepositoryImpl(db), new FollowerRepositoryImpl(db), new UserRepositoryImpl(db));


/**
 * @swagger
 * tags:
 *  name: post
 *  description: post endpoints
 * /post/:
 *   get:
 *     summary: Get posts
 *     tags: [post]
 *     responses:
 *       201:
 *         description: Got posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PostDTO'
 *       400:
 *         description: Error with the request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   post:
 *     summary: Create a posts
 *     tags: [post]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePostInputDTO'
 *     responses:
 *       201:
 *         description: Post created
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CreatePostInputDTO'
 *       400:
 *         description: Error with the request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * /post/{postId}:
 *   get:
 *     summary: Get post by id
 *     tags: [post]
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: The post id
 *     responses:
 *       201:
 *         description: Got post by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostDTO'
 *       400:
 *         description: Error with the request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     summary: Remove the post by id
 *     tags: [post]
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: The post id
 *     responses:
 *       200:
 *         description: The post was deleted
 *       404:
 *         description: The post was not found
 * /post/by_user/{userId}:
 *   get:
 *     summary: Get posts by user
 *     description: Retrieve posts created by a specific user.
 *     tags: [post]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user whose posts are to be retrieved.
 *     responses:
 *       200:
 *         description: A list of posts created by the specified user.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PostDTO'
 *       400:
 *         description: Error with the request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
postRouter.get('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { limit, before, after } = req.query as Record<string, string>

  const posts = await service.getLatestPosts(userId, { limit: Number(limit), before, after })

  return res.status(HttpStatus.OK).json(posts)
})

postRouter.get('/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { postId } = req.params

  const post = await service.getPost(userId, postId)

  return res.status(HttpStatus.OK).json(post)
})

postRouter.get('/by_user/:userId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { userId: authorId } = req.params

  const posts = await service.getPostsByAuthor(userId, authorId)

  return res.status(HttpStatus.OK).json(posts)
})

postRouter.post('/', BodyValidation(CreatePostInputDTO), async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const data = req.body

  const post = await service.createPost(userId, data)

  return res.status(HttpStatus.CREATED).json(post)
})

postRouter.delete('/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { postId } = req.params

  await service.deletePost(userId, postId)

  return res.status(HttpStatus.OK).send(`Deleted post ${postId}`)
})

/**
 * @swagger
 * components:
 *  schemas:
 *    PostDTO:
 *      type: object
 *      required:
 *        - id
 *        - authorId
 *        - content
 *        - images
 *        - createdAt
 *      properties:
 *        id:
 *          type: string
 *          description: Post id
 *        authorId:
 *          type: string
 *          description: Post author id
 *        content:
 *          type: string
 *          description: Post content
 *        images:
 *          type: array
 *          description: Post images
 *          items:
 *            type: string
 *        createdAt:
 *          type: string
 *          format: date
 *          description: Post init date
 *      tags: [post] 
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
