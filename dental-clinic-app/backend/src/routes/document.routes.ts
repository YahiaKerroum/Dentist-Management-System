import { Router } from "express";
import multer from "multer";
import { DocumentController } from "../controllers/document.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);

router.post("/", DocumentController.create);
router.get("/", DocumentController.getAll);
router.get("/:id", DocumentController.getById);
router.get("/patient/:patientId", DocumentController.getByPatientId);
router.post(
	"/upload",
	upload.single("file"),
	DocumentController.uploadWithFile
);
router.put("/:id", DocumentController.update);
router.delete("/:id", DocumentController.delete);

export default router;
