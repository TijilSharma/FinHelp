import type { NextFunction, Request, Response } from "express";
import { sendResponse } from "../utils/response.ts";
import { verifyToken } from "../utils/jwt.ts";

export const jwtMiddleware = (req: Request, res: Response, next: NextFunction)=>{
    const authHeader = req.headers.authorization;

    if(!authHeader){
        return sendResponse(res, 401, "No authorization header", false);
    }

    const token = authHeader.split(' ')[1];

    if(!token){
        return sendResponse(res,401,"No token inside auth header", false)
    }
    const decoded = verifyToken(token);

    req.user = decoded;

    next();

    
}