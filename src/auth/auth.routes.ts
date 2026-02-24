import express from "express";
import type { Router } from "express";
import { googleController, callbackController } from "./auth.controller.ts";

const authRouter:Router = express.Router();

authRouter.get('/google', googleController);
authRouter.get('/callback',callbackController);
// authRouter.get('/logout')

export default authRouter