import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { authMiddleware } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/role.middleware";

const router = Router();
const controller = new UserController();

router.use(authMiddleware);

router.get("/institution", controller.getInstitutionUsers);

router.patch("/:userId/role", requirePermission(u => ["ADMIN", "SUPER_ADMIN"].includes(u.role)), controller.updateRole);
router.delete("/:userId", requirePermission(u => ["ADMIN", "SUPER_ADMIN"].includes(u.role)), controller.softDelete);

export default router;
