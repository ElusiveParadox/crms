import { Router } from "express";
import { ResourceController } from "../controllers/ResourceController";
import { authMiddleware } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/role.middleware";

const router = Router();
const controller = new ResourceController();

router.post("/", authMiddleware, requirePermission(u => ["ADMIN", "SUPER_ADMIN"].includes(u.role)), controller.create);

export default router;
