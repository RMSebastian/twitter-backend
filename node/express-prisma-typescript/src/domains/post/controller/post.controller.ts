import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors'

import { db, BodyValidation,  } from '@utils'

import { PostRepositoryImpl } from '../repository'
import { PostService, PostServiceImpl } from '../service'
import { CreatePostInputDTO } from '../dto'
import { UserRepositoryImpl } from '@domains/user/repository'
import { FollowerRepositoryImpl } from '@domains/follower/repository'
import { ReactionRepositoryImpl } from '@domains/reaction'
import { S3ServiceImpl } from '@aws/service'
import { s3Client } from '@utils/s3client'
import { CommentService, CommentServiceImpl } from '@domains/comment/service'
import { CommentRepositoryImpl } from '@domains/comment/repository'

export const postRouter = Router()

// Use dependency injection
const followRepository = new FollowerRepositoryImpl(db);
const userRepository = new UserRepositoryImpl(db);
const s3client = new S3ServiceImpl(s3Client);

const service: PostService = new PostServiceImpl(
  new PostRepositoryImpl(db),
  followRepository,
  userRepository,
  s3client
  );
// Use d


/**
 * @swagger
 * tags:
 *  name: post
 *  description: post endpoints
 * /api/post/:
 *   get:
 *     security:
 *         - BearerAuth: []
 *     summary: Get posts
 *     tags: [post]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *         description: The amount of records to return
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *         description: The id of the record after the last returned record
 *       - in: query
 *         name: after
 *         schema:
 *           type: string
 *         description: The id of the record before the first returned record
 *     responses:
 *       2XX:
 *         description: Got posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExtendedPostDTO'
 *       4XX:
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
/**
 * @swagger
 * /api/post/{postId}:
 *   get:
 *     security:
 *         - BearerAuth: []
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
 *       2XX:
 *         description: Got post by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExtendedPostDTO'
 *       4XX:
 *         description: Error with the request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
postRouter.get('/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { postId } = req.params

  const post = await service.getPost(userId, postId)

  return res.status(HttpStatus.OK).json(post)
})
/**
 * @swagger
 * /api/post/by_user/{userId}:
 *   get:
 *     security:
 *         - BearerAuth: []
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
 *       2XX:
 *         description: A list of posts created by the specified user.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExtendedPostDTO'
 *       4XX:
 *         description: Error with the request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
postRouter.get('/by_user/:userId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { userId: authorId } = req.params

  const posts = await service.getPostsByAuthor(userId, authorId)

  return res.status(HttpStatus.OK).json(posts)
})
/**
 * @swagger
 * tags:
 *  name: post
 *  description: post endpoints
 * /api/post/follow:
 *   get:
 *     security:
 *         - BearerAuth: []
 *     summary: Get posts from users follow by the current user
 *     tags: [post]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *         description: The amount of records to return
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *         description: The id of the record after the last returned record
 *       - in: query
 *         name: after
 *         schema:
 *           type: string
 *         description: The id of the record before the first returned record
 *     responses:
 *       2XX:
 *         description: Got posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExtendedPostDTO'
 *       4XX:
 *         description: Error with the request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
postRouter.get('/follow', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { limit, before, after } = req.query as Record<string, string>

  const posts = await service.getLatestPosts(userId, { limit: Number(limit), before, after })

  return res.status(HttpStatus.OK).json(posts)
})
/**
 * @swagger
 * /api/post/:
 *   post:
 *     security:
 *         - BearerAuth: []
 *     summary: Create a posts
 *     tags: [post]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePostInputDTO'
 *     responses:
 *       2XX:
 *         description: Post created
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CreatePostInputDTO'
 *       4XX:
 *         description: Error with the request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
postRouter.post('/', BodyValidation(CreatePostInputDTO), async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const data = req.body
  data.parentId = null;
  const post = await service.createPost(userId, data)

  return res.status(HttpStatus.CREATED).json(post)
})
/**
 * @swagger
 * /api/post/{postId}:
 *   delete:
 *     security:
 *         - BearerAuth: []
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
 *       2XX:
 *         description: The post was deleted
 *       4XX:
 *         description: The post was not found
 */
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
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     PostDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The unique identifier of the post
 *         authorId:
 *           type: string
 *           description: The ID of the author of the post
 *         content:
 *           type: string
 *           description: The content of the post
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: List of image URLs associated with the post
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the post was created
 *         parentId:
 *           type: string
 *           nullable: true
 *           description: The ID of the parent post if this is a reply
 *     UserDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The unique identifier of the user
 *         username:
 *           type: string
 *           description: The username of the user
 *         image:
 *           type: string
 *           description: URL to the user's profile image
 *     ReactionDTO:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The unique identifier of the reaction
 *         type:
 *           type: string
 *           description: Type of the reaction (like, love, etc.)
 *     ExtendedPostDTO:
 *       allOf:
 *         - $ref: '#/components/schemas/PostDTO'
 *         - type: object
 *           properties:
 *             author:
 *               $ref: '#/components/schemas/UserDTO'
 *               description: Post author details
 *             reactions:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ReactionDTO'
 *               description: List of reactions to the post
 *             comments:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ExtendedPostDTO'
 *               description: List of comments on the post
 */
/**
 * @swagger
 * components:
 *  schemas:
 *    CreatePostInputDTO:
 *      type: object
 *      required:
 *        - content
 *        - images
 *      properties:
 *        parentId:
 *          type: string
 *          description: Post id (for comments)
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
