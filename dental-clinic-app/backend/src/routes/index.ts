import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import patientRoutes from "./patient.routes";
import appointmentRoutes from "./appointment.routes";
import treatmentRoutes from "./treatment.routes";
import paymentRoutes from "./payment.routes";
import expenseRoutes from "./expense.routes";
import reportRoutes from "./report.routes";
import documentRoutes from "./document.routes";
import roomRoutes from "./room.routes";
import toothRoutes from "./tooth.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/patients", toothRoutes);
router.use("/patients", patientRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/treatments", treatmentRoutes);
router.use("/payments", paymentRoutes);
router.use("/expenses", expenseRoutes);
router.use("/reports", reportRoutes);
router.use("/documents", documentRoutes);
router.use("/rooms", roomRoutes);

export default router;
