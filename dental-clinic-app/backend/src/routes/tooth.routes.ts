import { Router } from "express";
import { ToothController } from "../controllers/tooth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/:patientId/odontogram", ToothController.getOdontogram);
router.put("/:patientId/odontogram/:toothNumber", ToothController.upsertTooth);

export default router;
