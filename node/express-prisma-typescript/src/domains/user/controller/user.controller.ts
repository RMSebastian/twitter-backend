import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors'

import { db } from '@utils'

import { UserRepositoryImpl } from '../repository'
import { UserService, UserServiceImpl } from '../service'

export const userRouter = Router()

// Use dependency injection
const service: UserService = new UserServiceImpl(new UserRepositoryImpl(db))

/**
 * @swagger
 * tags:
 *  name: user
 *  description: user endpoints
 * /user/:
 *   get:
 *     summary: Get users
 *     tags: [user]
 *     responses:
 *       201:
 *         description: Got users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserDTO'
 *       400:
 *         description: Error with the request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     summary: Remove current users
 *     tags: [user]
 *     responses:
 *       200:
 *         description: The post was deleted
 *       404:
 *         description: The post was not found
 * /user/me:
 *   get:
 *     summary: Get my user info
 *     tags: [user]
 *     responses:
 *       201:
 *         description: Got my user info
 *         content:
 *           application/json:
 *             schema:
 *               items:
 *                 $ref: '#/components/schemas/userDTO'
 *       400:
 *         description: Error with the request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * /user/{userId}:
 *   get:
 *     summary: Get user by id
 *     tags: [user]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id
 *     responses:
 *       201:
 *         description: Got user by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserDTO'
 *       400:
 *         description: Error with the request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
userRouter.get('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { limit, skip } = req.query as Record<string, string>

  const users = await service.getUserRecommendations(userId, { limit: Number(limit), skip: Number(skip) })

  return res.status(HttpStatus.OK).json(users)
})

userRouter.get('/me', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const user = await service.getUser(userId)

  return res.status(HttpStatus.OK).json(user)
})

userRouter.get('/:userId', async (req: Request, res: Response) => {
  const { userId: otherUserId } = req.params

  const user = await service.getUser(otherUserId)

  return res.status(HttpStatus.OK).json(user)
})

userRouter.delete('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  await service.deleteUser(userId)

  return res.status(HttpStatus.OK)
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
