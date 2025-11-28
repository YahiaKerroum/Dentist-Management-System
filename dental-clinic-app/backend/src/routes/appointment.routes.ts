import { Router } from "express";
import { AppointmentController } from "../controllers/appointment.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";
import { Role } from "../types/prisma.types";

const router = Router();

router.use(authenticate);

router.post("/", authorize(Role.MANAGER, Role.DOCTOR, Role.ASSISTANT), AppointmentController.create);
router.get("/", authorize(Role.MANAGER, Role.DOCTOR, Role.ASSISTANT), AppointmentController.getAll);
router.get("/:id", authorize(Role.MANAGER, Role.DOCTOR, Role.ASSISTANT), AppointmentController.getById);
router.put("/:id", authorize(Role.MANAGER, Role.DOCTOR, Role.ASSISTANT), AppointmentController.update);
router.patch("/:id/status", authorize(Role.MANAGER, Role.DOCTOR, Role.ASSISTANT), AppointmentController.updateStatus);
router.delete("/:id", authorize(Role.MANAGER, Role.ASSISTANT), AppointmentController.delete);

export default router;
