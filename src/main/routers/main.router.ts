import type { Router } from "express";
import express from "express";
import { jwtMiddleware } from "../../middleware/jwt.middleware.ts";
import { dashboardData } from "../controllers/dashboard.controller.ts";

const mainRouter: Router = express.Router();

mainRouter.get('/dashboard', jwtMiddleware, dashboardData);

export default mainRouter