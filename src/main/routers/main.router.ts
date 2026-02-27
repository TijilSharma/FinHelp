import type { Router } from "express";
import express from "express";
import { jwtMiddleware } from "../../middleware/jwt.middleware.ts";
import { dashboardData } from "../controllers/dashboard.controller.ts";
import { addDebt, getDebts } from "../controllers/addDebt.controller.ts";

const mainRouter: Router = express.Router();

mainRouter.get('/dashboard', jwtMiddleware, dashboardData);
mainRouter.post('/addDebt', addDebt);
mainRouter.get('/getdebts', getDebts);
// mainRouter.get('/optimizedApproach', jwtMiddleware);

export default mainRouter