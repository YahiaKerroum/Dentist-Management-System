import { Router } from "express";
import { ExpenseController } from "../controllers/expense.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.post("/", ExpenseController.create);
router.get("/", ExpenseController.getAll);
router.get("/search", ExpenseController.search);
router.get("/:id", ExpenseController.getById);
router.put("/:id", ExpenseController.update);
router.delete("/:id", ExpenseController.delete);
router.patch("/:id/approve", ExpenseController.approve);

export default router;