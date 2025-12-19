import { Router } from "express";
import { ExpenseController } from "../controllers/expense.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";
import { Role } from "../types/prisma.types";

const router = Router();

router.use(authenticate);

// Only MANAGER can create expenses
router.post("/", authorize(Role.MANAGER), ExpenseController.create);

// MANAGER & ASSISTANT can view expenses
router.get("/", authorize(Role.MANAGER, Role.ASSISTANT), ExpenseController.getAll);

// MANAGER & ASSISTANT can search expenses
router.get("/search", authorize(Role.MANAGER, Role.ASSISTANT), ExpenseController.search);

// MANAGER & ASSISTANT can view single expense
router.get("/:id", authorize(Role.MANAGER, Role.ASSISTANT), ExpenseController.getById);

// Only MANAGER can update expenses
router.put("/:id", authorize(Role.MANAGER), ExpenseController.update);

// Only MANAGER can delete expenses
router.delete("/:id", authorize(Role.MANAGER), ExpenseController.delete);

// Only MANAGER can approve expenses
router.patch("/:id/approve", authorize(Role.MANAGER), ExpenseController.approve);

export default router;