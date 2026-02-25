import express from "express";
import type { Router } from "express";
import { googleController, callbackController } from "./auth.controller.ts";
import { onboardingController } from "./onboardingController.ts";
import { jwtMiddleware } from "../middleware/jwt.middleware.ts";

const authRouter:Router = express.Router();

authRouter.get('/google', googleController);
authRouter.get('/callback',callbackController);
authRouter.post('/onboard',jwtMiddleware,onboardingController);
// authRouter.get('/logout')

export default authRouter