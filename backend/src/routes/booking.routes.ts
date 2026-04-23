// import { Router } from "express";
// import { BookingController } from "../controllers/BookingController";
// import { authMiddleware } from "../middleware/auth.middleware";
// import { requirePermission } from "../middleware/role.middleware";

// const router = Router();
// const controller = new BookingController();

// router.use(authMiddleware);

// router.post("/", controller.create);
// router.get("/me", controller.myBookings);

// router.post("/:id/cancel", controller.cancel);
// router.post("/:id/approve", requirePermission(u => ["ADMIN", "SUPER_ADMIN"].includes(u.role)), controller.approve);
// router.post("/:id/reject", requirePermission(u => ["ADMIN", "SUPER_ADMIN"].includes(u.role)), controller.reject);

// export default router;

import { Router } from "express";
import { BookingController } from "../controllers/BookingController";
import { BookingService } from "../services/BookingService";
import { authMiddleware } from "../middleware/auth.middleware";
import { institutionGuard } from "../middleware/InstitutionMiddleware";
import { requirePermission } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  createBookingSchema,
  bookingIdParamSchema,
} from "../validators/booking.validator";

const router = Router();

const bookingService = new BookingService();
const controller = new BookingController(bookingService);

// CREATE
router.post(
  "/",
  authMiddleware,
  institutionGuard,
  validate(createBookingSchema),
  controller.create
);

// APPROVE
router.patch(
  "/:id/approve",
  authMiddleware,
  institutionGuard,
  validate(bookingIdParamSchema, "params"),
  requirePermission((u) => u.canApproveBooking()),
  controller.approve
);

// REJECT
router.patch(
  "/:id/reject",
  authMiddleware,
  institutionGuard,
  validate(bookingIdParamSchema, "params"),
  requirePermission((u) => u.canApproveBooking()),
  controller.reject
);

// CANCEL
router.patch(
  "/:id/cancel",
  authMiddleware,
  institutionGuard,
  validate(bookingIdParamSchema, "params"),
  controller.cancel
);

export default router;