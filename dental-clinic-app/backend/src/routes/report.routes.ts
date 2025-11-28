import { Router } from "express";
import { ReportController } from "../controllers/report.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";
import { Role } from "../types/prisma.types";

const router = Router();

router.use(authenticate);

router.get("/dashboard", authorize(Role.MANAGER, Role.DOCTOR), ReportController.getDashboard);
router.get("/financial", authorize(Role.MANAGER), ReportController.getFinancial);
router.get("/appointments", authorize(Role.MANAGER), ReportController.getAppointments);
router.get("/patients", authorize(Role.MANAGER), ReportController.getPatients);

export default router;
