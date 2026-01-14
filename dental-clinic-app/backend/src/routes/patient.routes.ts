
import { Router } from "express";
import { PatientController } from "../controllers/patient.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.post("/", PatientController.create);
router.get("/", PatientController.getAll);
router.get("/:id", PatientController.getById);
router.get("/:id/history", PatientController.getHistory);
router.put("/:id", PatientController.update);
router.delete("/:id", PatientController.delete);

export default router;
