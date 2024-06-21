import { validate } from 'class-validator'
import { NextFunction, Request, Response } from 'express'
import { NotFoundException, ValidationException } from './errors'
import { plainToInstance } from 'class-transformer'
import { ClassType } from '@types'
import { ReactionType } from '@prisma/client'

export function BodyValidation<T> (target: ClassType<T>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    req.body = plainToInstance(target, req.body)
    const errors = await validate(req.body, {
      whitelist: true,
      forbidNonWhitelisted: true
    })

    if (errors.length > 0) { throw new ValidationException(errors.map(error => ({ ...error, target: undefined, value: undefined }))) }

    next()
  }
}
export async function ActionValidation(req: Request, res: Response, next: NextFunction){
  const {action} = req.params;

  if(Object.values(ReactionType).includes(action as ReactionType)){
    next()
  }else{
    throw new NotFoundException(`${action}`)
  }
}
export async function SocketBodyValidation<T>(target: ClassType<T>,data: any): Promise<boolean>{
  data = plainToInstance(target,data);

  const errors = await validate(data, {
    whitelist: true,
    forbidNonWhitelisted: true
  });
  
  return (errors.length > 0) ?false:true;
}