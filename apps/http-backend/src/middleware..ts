import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import {JWT_SECRET} from "@repo/common-backend/config"

interface ExtendedJwt extends JwtPayload {
  userId: string;
}

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function middleware(req:AuthenticatedRequest,res:Response,next:NextFunction) {
    const token=req.headers["authorization"] ?? '';
    const decoded=jwt.verify(token,JWT_SECRET) as ExtendedJwt ;

    if(decoded){
   
        req.userId=decoded.userId;
        next();
    } else {
        res.status(403).json({
            msg:"Unauthorized"
        })
    }

}