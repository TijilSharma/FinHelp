import type { NextFunction, Request, Response } from "express";
import { sendResponse } from "../utils/response.ts";
import { verifyToken } from "../utils/jwt.ts";


export const jwtMiddleware = (req: Request, res: Response, next: NextFunction)=>{
    const token = req.cookies.token;

    if(!token){
        return sendResponse(res,401,"Unauthorized", false)
    }
    const decoded = verifyToken(token);

    req.user = decoded;

    next();

    
}