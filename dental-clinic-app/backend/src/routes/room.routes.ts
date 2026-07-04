import { Router } from "express";
import { RoomController } from "../controllers/room.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", RoomController.getAll);

export default router;
