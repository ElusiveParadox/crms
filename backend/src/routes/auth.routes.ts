import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { authLimiter } from "../middleware/rateLimiter";

const router = Router();
const controller = new AuthController();

router.post("/register", authLimiter, controller.register);
router.post("/login", authLimiter, controller.login);

export default router;
