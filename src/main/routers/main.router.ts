import type { Router } from "express";
import express from "express";
import { jwtMiddleware } from "../../middleware/jwt.middleware.ts";

const mainRouter: Router = express.Router();

mainRouter.get('/dashboard', jwtMiddleware);

export default mainRouter