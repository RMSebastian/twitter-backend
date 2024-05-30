import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors'

export const healthRouter = Router()
/**
 * @swagger
 * tags:
 *  name: health
 *  description: health endpoints
 * /health/:
 *   get:
 *     summary: Get server heatlh
 *     tags: [health]
 *     responses:
 *       201:
 *         description: Got health status
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: good
 *       400:
 *         description: Error with the request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
healthRouter.get('/', (req: Request, res: Response) => {
  return res.status(HttpStatus.OK).send({message: "good"})
})
