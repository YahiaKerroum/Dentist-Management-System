import { Router } from "express";
import { ExpenseController } from "../controllers/expense.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";
import { Role } from "../types/prisma.types";

const router = Router();

router.use(authenticate);

router.post("/", authorize(Role.MANAGER), ExpenseController.create);
router.get("/", authorize(Role.MANAGER), ExpenseController.getAll);
// search route
router.get("/search", authorize(Role.MANAGER), ExpenseController.search);

router.get("/:id", authorize(Role.MANAGER), ExpenseController.getById);
// update route
router.put("/:id", authorize(Role.MANAGER), ExpenseController.update);
// delete route
router.delete("/:id", authorize(Role.MANAGER), ExpenseController.delete);

router.patch("/:id/approve", authorize(Role.MANAGER), ExpenseController.approve);

export default router;
