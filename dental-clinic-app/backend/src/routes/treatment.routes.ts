import { Router } from "express";
import { TreatmentController } from "../controllers/treatment.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.post("/", TreatmentController.create);
router.get("/", TreatmentController.getAll);
router.get("/:id", TreatmentController.getById);
router.put("/:id", TreatmentController.update);
router.patch("/:id/status", TreatmentController.updateStatus);
router.delete("/:id", TreatmentController.delete);

export default router;
