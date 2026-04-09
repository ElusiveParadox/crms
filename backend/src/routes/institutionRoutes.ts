import { Router } from "express";
import { InstitutionController } from "../controllers/InstitutionController";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const controller = new InstitutionController();

router.get("/", controller.search);

router.post("/", authMiddleware, controller.create);
router.post("/join", authMiddleware, controller.join);

export default router;