import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors'

import { db, BodyValidation } from '@utils'
import { UserRepositoryImpl } from '@domains/user/repository'

import { AuthService, AuthServiceImpl } from '../service'
import { LoginInputDTO, SignupInputDTO } from '../dto'

export const authRouter = Router()

// Use dependency injection
const service: AuthService = new AuthServiceImpl(new UserRepositoryImpl(db))

/**
 * @swagger
 * tags:
 *   - name: auth
 *     description: auth endpoints 
 * /user/signup:
 *   post:
 *     summary: Signup a new user
 *     description: Create a user, comes with a token.
 *     tags: [auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupInputDTO'
 *     responses:
 *       201:
 *         description: User Created, comes with a token
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Error with the request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRouter.post('/signup', BodyValidation(SignupInputDTO), async (req: Request, res: Response) => {
  const data = req.body

  const token = await service.signup(data)

  return res.status(HttpStatus.CREATED).json(token)
})
/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Login a user
 *     description: Login a user, comes with a token.
 *     tags: [auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupInputDTO'
 *     responses:
 *       201:
 *         description: User Logged, comes with a token
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Error with the request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRouter.post('/login', BodyValidation(LoginInputDTO), async (req: Request, res: Response) => {
  const data = req.body

  const token = await service.login(data)

  return res.status(HttpStatus.OK).json(token)
})
/**
 * @swagger
 * components:
 *  schemas:
 *    ErrorResponse:
 *      type: object
 *      properties:
 *        type:
 *          type: string
 *          description: Error's description
 *      tags: [auth]
 */
/**
 * @swagger
 * components:
 *  schemas:
 *    LoginInputDTO:
 *      type: object
 *      required:
 *        - password
 *      properties:
 *        email:
 *          type: string
 *          format: email
 *          description: User's personal email
 *        username:
 *          type: string
 *          description: User's username
 *        password:
 *          type: string
 *          description: User's password
 *      tags: [auth]
 */
/**
 * @swagger
 * components:
 *  schemas:
 *    SignupInputDTO:
 *      type: object
 *      required:
 *        - email
 *        - username
 *        - password
 *      properties:
 *        email:
 *          type: string
 *          format: email
 *          description: User's personal email
 *        username:
 *          type: string
 *          description: User's username
 *        password:
 *          type: string
 *          description: User's password
 *      tags: [auth]
 */