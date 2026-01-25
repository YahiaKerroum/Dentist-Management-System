import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Search payments - Must come before /:id to avoid conflicts
router.get(
  "/search",
  PaymentController.search
);

// Get payment statistics for a patient
router.get(
  "/stats/:patientId",
  PaymentController.getStats
);

// Get all payments for a specific patient
router.get(
  "/patient/:patientId",
  PaymentController.getByPatient
);

// Get all payments (with optional filtering)
router.get(
  "/",
  PaymentController.getAll
);

// Get single payment by ID
router.get(
  "/:id",
  PaymentController.getById
);

// Create new payment
router.post(
  "/",
  PaymentController.create
);

// Update existing payment
router.put(
  "/:id",
  PaymentController.update
);

// Delete payment
router.delete(
  "/:id",
  PaymentController.delete
);

export default router;