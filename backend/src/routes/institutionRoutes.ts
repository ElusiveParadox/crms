import { Router } from "express";
import { InstitutionController } from "../controllers/InstitutionController";
import { authMiddleware } from "../middleware/auth.middleware";
import { institutionGuard } from "../middleware/InstitutionMiddleware";
import { requirePermission } from "../middleware/role.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  institutionCreateSchema,
  institutionParamSchema,
  institutionQuerySchema,
  institutionUpdateSchema,
} from "../validators/institution.validator";

const router = Router();
const controller = new InstitutionController();

router.get("/search", controller.search);

router.post(
  "/",
  authMiddleware,
  validate(institutionCreateSchema),
  controller.create
);

router.post("/join", authMiddleware, controller.join);

router.get(
  "/",
  authMiddleware,
  institutionGuard,
  validate(institutionQuerySchema, "query"),
  controller.getAll
);

router.get(
  "/:id",
  authMiddleware,
  institutionGuard,
  validate(institutionParamSchema, "params"),
  controller.getById
);

router.patch(
  "/:id",
  authMiddleware,
  institutionGuard,
  validate(institutionParamSchema, "params"),
  validate(institutionUpdateSchema),
  requirePermission((user) => user.canOverrideConflicts()),
  controller.update
);

router.delete(
  "/:id",
  authMiddleware,
  institutionGuard,
  validate(institutionParamSchema, "params"),
  requirePermission((user) => user.canOverrideConflicts()),
  controller.delete
);

export default router;
