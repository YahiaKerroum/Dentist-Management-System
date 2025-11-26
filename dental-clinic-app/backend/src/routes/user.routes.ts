import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";
import { Role } from "../types/prisma.types";

const router = Router();

router.use(authenticate);

router.post("/", authorize(Role.MANAGER), UserController.create);
router.get("/", authorize(Role.MANAGER, Role.DOCTOR, Role.ASSISTANT), UserController.getAll);
router.get("/me", UserController.getMe);
router.put("/me", UserController.updateMe);
router.get("/:id", authorize(Role.MANAGER, Role.DOCTOR, Role.ASSISTANT), UserController.getById);
router.put("/:id", authorize(Role.MANAGER), UserController.update);
router.delete("/:id", authorize(Role.MANAGER), UserController.delete);

export default router;
