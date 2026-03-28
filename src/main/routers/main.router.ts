import type { Router } from "express";
import express from "express";
import { jwtMiddleware } from "../../middleware/jwt.middleware.ts";
import { dashboardData, getProfile } from "../controllers/dashboard.controller.ts";
import { addDebt, getDebts } from "../controllers/addDebt.controller.ts";
import { getUSP } from "../controllers/usp.controller.ts";

const mainRouter: Router = express.Router();

mainRouter.get('/dashboard', jwtMiddleware, dashboardData);
mainRouter.post('/addDebt', jwtMiddleware, addDebt);
mainRouter.get('/getdebts', jwtMiddleware, getDebts);
mainRouter.get('/optimizedApproach', jwtMiddleware, getUSP);
mainRouter.get('/profile', jwtMiddleware, getProfile);

export default mainRouter