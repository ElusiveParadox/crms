import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { authMiddleware } from "../middleware/auth.middleware";
import { authLimiter } from "../middleware/rateLimiter";

const router = Router();
const controller = new AuthController();

router.post("/register", authLimiter, controller.register);
router.post("/login", authLimiter, controller.login);
router.get("/me", authMiddleware, controller.me);
router.post("/logout", authMiddleware, controller.logout);

export default router;
