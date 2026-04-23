import { Router } from "express";
import { ResourceController } from "../controllers/ResourceController";
import { authMiddleware } from "../middleware/auth.middleware";
import { institutionGuard } from "../middleware/InstitutionMiddleware";
import { requirePermission } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  resourceCreateSchema,
  resourceParamSchema,
  resourceQuerySchema,
  resourceUpdateSchema,
} from "../validators/resource.validator";

const router = Router();
const controller = new ResourceController();

router.use(authMiddleware, institutionGuard);

router.post(
  "/",
  validate(resourceCreateSchema),
  requirePermission((user) => user.canOverrideConflicts()),
  controller.create
);

router.get(
  "/",
  validate(resourceQuerySchema, "query"),
  controller.getAll
);

router.get(
  "/:id",
  validate(resourceParamSchema, "params"),
  controller.getById
);

router.patch(
  "/:id",
  validate(resourceParamSchema, "params"),
  validate(resourceUpdateSchema),
  requirePermission((user) => user.canOverrideConflicts()),
  controller.update
);

router.delete(
  "/:id",
  validate(resourceParamSchema, "params"),
  requirePermission((user) => user.canOverrideConflicts()),
  controller.delete
);

export default router;
