import { Router } from "express";
import { ResourceController } from "../controllers/ResourceController";
import { authMiddleware } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/role.middleware";

const router = Router();
const controller = new ResourceController();

router.get("/", authMiddleware, controller.getAll);
router.post("/", authMiddleware, controller.create);

export default router;
