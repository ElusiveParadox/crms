import { Router } from "express";
import { BookingController } from "../controllers/BookingController";

const router = Router();
const controller = new BookingController();

router.post("/", controller.create);
router.get("/me", controller.myBookings);
router.post("/:id/cancel", controller.cancel);
router.post("/:id/approve", controller.approve);
router.post("/:id/reject", controller.reject);

export default router;