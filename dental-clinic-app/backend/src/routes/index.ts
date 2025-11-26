import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import patientRoutes from "./patient.routes";
import appointmentRoutes from "./appointment.routes";
import treatmentRoutes from "./treatment.routes";
import paymentRoutes from "./payment.routes";
import expenseRoutes from "./expense.routes";
import reportRoutes from "./report.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/patients", patientRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/treatments", treatmentRoutes);
router.use("/payments", paymentRoutes);
router.use("/expenses", expenseRoutes);
router.use("/reports", reportRoutes);

export default router;
