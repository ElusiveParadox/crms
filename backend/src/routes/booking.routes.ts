import { Router } from "express";
import { BookingController } from "../controllers/BookingController";
import { authMiddleware } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/role.middleware";

const router = Router();
const controller = new BookingController();

router.use(authMiddleware);

router.post("/", controller.create);
router.get("/me", controller.myBookings);
router.get("/all", requirePermission(u => ["ADMIN", "SUPER_ADMIN"].includes(u.role)), controller.getAll);

router.post("/:id/cancel", controller.cancel);
router.post("/:id/approve", requirePermission(u => ["ADMIN", "SUPER_ADMIN"].includes(u.role)), controller.approve);
router.post("/:id/reject", requirePermission(u => ["ADMIN", "SUPER_ADMIN"].includes(u.role)), controller.reject);

export default router;