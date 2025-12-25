import { Router } from "express";
import multer from "multer";
import { DocumentController } from "../controllers/document.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";
import { Role } from "../types/prisma.types";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);

router.post("/", authorize(Role.MANAGER, Role.DOCTOR, Role.ASSISTANT), DocumentController.create);
router.get("/", authorize(Role.MANAGER, Role.DOCTOR, Role.ASSISTANT), DocumentController.getAll);
router.get("/:id", authorize(Role.MANAGER, Role.DOCTOR, Role.ASSISTANT), DocumentController.getById);
router.get("/patient/:patientId", authorize(Role.MANAGER, Role.DOCTOR, Role.ASSISTANT), DocumentController.getByPatientId);
router.post(
	"/upload",
	authorize(Role.MANAGER, Role.DOCTOR, Role.ASSISTANT),
	upload.single("file"),
	DocumentController.uploadWithFile
);
router.put("/:id", authorize(Role.MANAGER, Role.DOCTOR, Role.ASSISTANT), DocumentController.update);
router.delete("/:id", authorize(Role.MANAGER, Role.DOCTOR, Role.ASSISTANT), DocumentController.delete);

export default router;
