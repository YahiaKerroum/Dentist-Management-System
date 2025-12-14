import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";
import { Role } from "../types/prisma.types";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Search payments - Must come before /:id to avoid conflicts
router.get(
  "/search",
  authorize(Role.MANAGER, Role.ASSISTANT),
  PaymentController.search
);

// Get payment statistics for a patient
router.get(
  "/stats/:patientId",
  authorize(Role.MANAGER, Role.ASSISTANT),
  PaymentController.getStats
);

// Get all payments for a specific patient
router.get(
  "/patient/:patientId",
  authorize(Role.MANAGER, Role.ASSISTANT),
  PaymentController.getByPatient
);

// Get all payments (with optional filtering)
router.get(
  "/",
  authorize(Role.MANAGER, Role.ASSISTANT),
  PaymentController.getAll
);

// Get single payment by ID
router.get(
  "/:id",
  authorize(Role.MANAGER, Role.ASSISTANT),
  PaymentController.getById
);

// Create new payment
router.post(
  "/",
  authorize(Role.MANAGER, Role.ASSISTANT),
  PaymentController.create
);

// Update existing payment
router.put(
  "/:id",
  authorize(Role.MANAGER, Role.ASSISTANT),
  PaymentController.update
);

// Delete payment
router.delete(
  "/:id",
  authorize(Role.MANAGER, Role.ASSISTANT),
  PaymentController.delete
);

export default router;