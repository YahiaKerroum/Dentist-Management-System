import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";
import { Role } from "../types/prisma.types";

const router = Router();

router.use(authenticate);

router.post("/", authorize(Role.MANAGER, Role.ASSISTANT), PaymentController.create);
router.get("/", authorize(Role.MANAGER, Role.ASSISTANT), PaymentController.getAll);
router.get("/:id", authorize(Role.MANAGER, Role.ASSISTANT), PaymentController.getById);

export default router;
