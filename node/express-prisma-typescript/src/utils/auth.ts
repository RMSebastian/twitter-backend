import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { Request, Response } from 'express'
import { Constants } from '@utils'
import { UnauthorizedException } from '@utils/errors'
import { Socket } from 'socket.io'
import { error } from 'console'

export const generateAccessToken = (payload: Record<string, string | boolean | number>): string => {
  // Do not use this in production, the token will last 24 hours
  // For production apps, use a 15-minute token with a refresh token stored in a HttpOnly Cookie
  return jwt.sign(payload, Constants.TOKEN_SECRET, { expiresIn: '24h' })
}

export const withAuth = (req: Request, res: Response, next: () => any): void => {
  // Get the token from the authorization header
  const [bearer, token] = (req.headers.authorization)?.split(' ') ?? []

  // Verify that the Authorization header has the expected shape
  if (!bearer || !token || bearer !== 'Bearer') throw new UnauthorizedException('MISSING_TOKEN')

  // Verify that the token is valid
  jwt.verify(token, Constants.TOKEN_SECRET, (err, context) => {
    if (err) throw new UnauthorizedException('INVALID_TOKEN')
    res.locals.context = context
    next()
  })
}
export const withAuthSocket = (socket: Socket, next: (err?:any) => any) => {
  const token = socket.handshake.headers['authorization']?.split(' ')[1];

  if (!token) {
    return next(new UnauthorizedException('INVALID_TOKEN'));
  }
  
  jwt.verify(token, Constants.TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return next(new UnauthorizedException('INVALID_TOKEN'));
      }
      socket.decoded = decoded;
      next();

  });
}


export const encryptPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10)
}

export const checkPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash)
}
