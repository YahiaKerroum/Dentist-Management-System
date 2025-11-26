import { Router } from "express";
import { TreatmentController } from "../controllers/treatment.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";
import { Role } from "../types/prisma.types";

const router = Router();

router.use(authenticate);

router.post("/", authorize(Role.MANAGER, Role.DOCTOR), TreatmentController.create);
router.get("/", authorize(Role.MANAGER, Role.DOCTOR), TreatmentController.getAll);
router.get("/:id", authorize(Role.MANAGER, Role.DOCTOR), TreatmentController.getById);
router.put("/:id", authorize(Role.MANAGER, Role.DOCTOR), TreatmentController.update);
router.patch("/:id/complete", authorize(Role.MANAGER, Role.DOCTOR), TreatmentController.markCompleted);

export default router;
