import { Router } from "express";
import { AppointmentController } from "../controllers/appointment.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.post("/", AppointmentController.create);
router.get("/", AppointmentController.getAll);
router.get("/:id", AppointmentController.getById);
router.put("/:id", AppointmentController.update);
router.patch("/:id/status", AppointmentController.updateStatus);
router.delete("/:id", AppointmentController.delete);

export default router;
