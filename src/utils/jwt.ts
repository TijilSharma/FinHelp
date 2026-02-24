import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET;

export const signToken = (id: string)=>{
    if(!secret){
        return "No secret provided"
    }
    const token = jwt.sign({id},secret);
    return token
}