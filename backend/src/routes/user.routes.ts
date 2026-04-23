import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { authMiddleware } from "../middleware/auth.middleware";
import { institutionGuard } from "../middleware/InstitutionMiddleware";
import { requirePermission } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  userCreateSchema,
  userParamSchema,
  userQuerySchema,
  userUpdateSchema,
} from "../validators/user.validator";

const router = Router();
const controller = new UserController();

router.use(authMiddleware, institutionGuard);

router.post(
  "/",
  validate(userCreateSchema),
  requirePermission((user) => user.canOverrideConflicts()),
  controller.create
);

router.get(
  "/",
  validate(userQuerySchema, "query"),
  controller.getAll
);

router.get(
  "/:id",
  validate(userParamSchema, "params"),
  controller.getById
);

router.patch(
  "/:id",
  validate(userParamSchema, "params"),
  validate(userUpdateSchema),
  requirePermission((user) => user.canOverrideConflicts()),
  controller.update
);

router.delete(
  "/:id",
  validate(userParamSchema, "params"),
  requirePermission((user) => user.canOverrideConflicts()),
  controller.delete
);

export default router;
