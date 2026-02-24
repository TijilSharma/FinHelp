import dotenv from "dotenv"
dotenv.config();

import express from 'express'
import { sendResponse } from './utils/response.ts';
import authRouter from './auth/auth.routes.ts';

const app = express();

app.use(express.json());
app.use('/api/auth', authRouter);
// app.use('/api/v1');
app.get('/heartbeat',(req,res)=>{
    return sendResponse(res, 200, "Healthy Server", true)
})



app.listen(3000, ()=>{
    console.log("Listening on port 3000");
})