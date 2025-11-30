
import { Router } from "express";
import { PatientController } from "../controllers/patient.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";
import { Role } from "../types/prisma.types";

const router = Router();

router.use(authenticate);

router.post("/", authorize(Role.MANAGER, Role.DOCTOR, Role.ASSISTANT), PatientController.create);
router.get("/", authorize(Role.MANAGER, Role.DOCTOR, Role.ASSISTANT), PatientController.getAll);
router.get("/:id", authorize(Role.MANAGER, Role.DOCTOR, Role.ASSISTANT), PatientController.getById);
router.get("/:id/history", authorize(Role.MANAGER, Role.DOCTOR), PatientController.getHistory);
router.put("/:id", authorize(Role.MANAGER, Role.DOCTOR, Role.ASSISTANT), PatientController.update);
router.delete("/:id", authorize(Role.MANAGER, Role.DOCTOR), PatientController.delete);

export default router;
