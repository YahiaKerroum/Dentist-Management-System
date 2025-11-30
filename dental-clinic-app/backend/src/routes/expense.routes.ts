import { Router } from "express";
import { ExpenseController } from "../controllers/expense.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";
import { Role } from "../types/prisma.types";

const router = Router();

router.use(authenticate);

router.post("/", authorize(Role.MANAGER), ExpenseController.create);
router.get("/", authorize(Role.MANAGER), ExpenseController.getAll);
router.get("/:id", authorize(Role.MANAGER), ExpenseController.getById);
router.patch("/:id/approve", authorize(Role.MANAGER), ExpenseController.approve);

export default router;
