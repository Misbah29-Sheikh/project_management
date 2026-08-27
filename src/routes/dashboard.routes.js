import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getDashboard } from "../controllers/dashboard.controllers.js";

const router = Router();

router.get("/", verifyJWT, getDashboard);

export default router;