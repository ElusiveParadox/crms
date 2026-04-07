import { Router } from "express";
import { InstitutionController } from "../controllers/InstitutionController";

const router = Router();
const controller = new InstitutionController();

router.get("/", controller.search);
router.post("/", controller.create);
router.post("/join", controller.join);

export default router;