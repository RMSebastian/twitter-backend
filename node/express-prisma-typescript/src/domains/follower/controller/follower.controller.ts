import { Request, Response, Router } from "express";

import 'express-async-errors'
import { FollowerService, FollowerServiceImpl } from "../service";
import { FollowerRepositoryImpl } from "../repository";
import { db } from "@utils";
import httpStatus from "http-status";

export const followerRouter = Router();

//Dependency injection
const service: FollowerService = new FollowerServiceImpl(new FollowerRepositoryImpl(db))

followerRouter.post("/follow/:userId",async (req: Request,res: Response)=>{
    
    const{userId} = res.locals.context; // get this user (follower)
    const{userId: otherUserId} = req.params;

    const follow = await service.follow(userId,otherUserId);
    
    return res.status(httpStatus.CREATED).json(follow);
});

followerRouter.post("/unfollow/:userId", async(req: Request, res: Response)=>{

    const{userId} = res.locals.context; // get this user (follower)
    const{userId: otherUserId} = req.params;

    const follow = await service.unfollow(userId,otherUserId);
    
    return res.status(httpStatus.CREATED).json(follow);
})