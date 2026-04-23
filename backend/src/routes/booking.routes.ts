import { Router } from "express";
import { BookingController } from "../controllers/BookingController";
import { authMiddleware } from "../middleware/auth.middleware";
import { institutionGuard } from "../middleware/InstitutionMiddleware";
import { requirePermission } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  bookingCreateSchema,
  bookingParamSchema,
  bookingQuerySchema,
  bookingUpdateSchema,
} from "../validators/booking.validator";

const router = Router();
const controller = new BookingController();

router.use(authMiddleware, institutionGuard);

router.post(
  "/",
  validate(bookingCreateSchema),
  controller.create
);

router.get(
  "/",
  validate(bookingQuerySchema, "query"),
  controller.getAll
);

router.get(
  "/:id",
  validate(bookingParamSchema, "params"),
  controller.getById
);

router.patch(
  "/:id",
  validate(bookingParamSchema, "params"),
  validate(bookingUpdateSchema),
  controller.update
);

router.delete(
  "/:id",
  validate(bookingParamSchema, "params"),
  controller.delete
);

router.patch(
  "/:id/cancel",
  validate(bookingParamSchema, "params"),
  controller.cancel
);

router.patch(
  "/:id/approve",
  validate(bookingParamSchema, "params"),
  requirePermission((user) => user.canApproveBooking()),
  controller.approve
);

router.patch(
  "/:id/reject",
  validate(bookingParamSchema, "params"),
  requirePermission((user) => user.canApproveBooking()),
  controller.reject
);

export default router;
