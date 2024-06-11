import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors'

import { BodyValidation, db } from '@utils'

import { UserRepositoryImpl } from '../repository'
import { UserService, UserServiceImpl } from '../service'
import { UpdateUserInputDTO } from '../dto'

export const userRouter = Router()

// Use dependency injection
const service: UserService = new UserServiceImpl(new UserRepositoryImpl(db));
/**
 * @swagger
 * tags:
 *  name: user
 *  description: user endpoints
 * /api/user/:
 *  get:
 *    security:
 *        - apiKey: []
 *    summary: "Get a list of all users"
 *    tags: [user]
 *    description: get a list of all user recommendations paginated according the user that sends it
 *    responses:
 *        2XX:
 *            description: returned the list of user recommendations
 *            content:
 *                application/json:
 *                    schema:
 *                        type: array
 *                        items:
 *                            $ref: '#/components/schemas/UserDTO'
 */
userRouter.get('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { limit, skip } = req.query as Record<string, string>

  const users = await service.getUserRecommendations(userId, { limit: Number(limit), skip: Number(skip) })

  return res.status(HttpStatus.OK).json(users)
})
/**
 * @swagger
 * /api/user/me:
 *   get:
 *     security:
 *         - apiKey: []
 *     summary: Get my user info
 *     tags: [user]
 *     responses:
 *       2XX:
 *         description: Got my user info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       4XX:
 *         description: Error with the request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRouter.get('/me', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const user = await service.getUser(userId)

  return res.status(HttpStatus.OK).json(user)
})
/**
 * @swagger
 * /api/user/{userId}:
 *   get:
 *     security:
 *         - apiKey: []
 *     summary: "Get user by id"
 *     tags: [user]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id
 *     responses:
 *       2XX:
 *         description: Got user by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserDTO'
 *       4XX:
 *         description: Error with the request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRouter.get('/:userId', async (req: Request, res: Response) => {
  const { userId: otherUserId } = req.params

  const user = await service.getUser(otherUserId)

  return res.status(HttpStatus.OK).json(user)
})
/**
 * @swagger
 * /api/user/:
 *   delete:
 *     security:
 *         - apiKey: []
 *     summary: Remove current users
 *     tags: [user]
 *     responses:
 *       2XX:
 *         description: The post was deleted
 *       4XX:
 *         description: The post was not found
 */
userRouter.delete('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  await service.deleteUser(userId)

  return res.status(HttpStatus.OK).json({message: "User Deleted"})
})
userRouter.post('/update/:userId',BodyValidation(UpdateUserInputDTO), async (req: Request, res: Response) =>{
  const {userId: otherUserId} = req.params;
  const data = req.body;

  const user = await service.updateUser(otherUserId, data)

  return res.status(HttpStatus.OK).json(user);
})
/**
 * @swagger
 * components:
 *  schemas:  
 *    UserDTO:
 *      type: object
 *      required:
 *        - id
 *        - name
 *        - createdAt
 *      properties:
 *        id:
 *          type: string
 *          description: User's id
 *        name:
 *          type: string
 *          description: User's name
 *        createdAt:
 *          type: string
 *          format: date
 *          description: User's creation date
 *      tags: [user]
 */
