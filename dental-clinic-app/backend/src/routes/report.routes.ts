import { Router } from "express";
import { ReportController } from "../controllers/report.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/rbac.middleware";
import { Role } from "../types/prisma.types";

const router = Router();

router.use(authenticate);

router.get("/dashboard", authorize(Role.MANAGER, Role.DOCTOR), ReportController.getDashboard);
router.get("/financial", authorize(Role.MANAGER), ReportController.getFinancial);
router.get("/appointments", authorize(Role.MANAGER), ReportController.getAppointments);
router.get("/patients", authorize(Role.MANAGER), ReportController.getPatients);

// 1. My Patients Count - DOCTOR
router.get("/my-patients-count", authorize(Role.DOCTOR), ReportController.getMyPatientsCount);

// 2. Total Patients - MANAGER
router.get("/total-patients", authorize(Role.MANAGER), ReportController.getTotalPatients);

// 3. My Appointments Today/This Week - DOCTOR (use ?period=today or ?period=week)
router.get("/my-appointments", authorize(Role.DOCTOR), ReportController.getMyAppointments);

// 4. Cancellations Today/This Week - ASSISTANT (use ?period=today or ?period=week)
router.get("/cancellations", authorize(Role.ASSISTANT), ReportController.getCancellations);

// 5. Appointments Overview - MANAGER
router.get("/appointments-overview", authorize(Role.MANAGER), ReportController.getAppointmentsOverview);

// 6. Most Common Treatment Types - ALL ROLES
router.get("/common-treatments", authorize(Role.MANAGER, Role.DOCTOR, Role.ASSISTANT), ReportController.getMostCommonTreatments);

// 7. Expenses Summary by Category - MANAGER
router.get("/expenses-by-category", authorize(Role.MANAGER), ReportController.getExpensesByCategory);

// 8. Expense Trends Chart - MANAGER (use ?months=6)
router.get("/expense-trends", authorize(Role.MANAGER), ReportController.getExpenseTrends);

// 9. Appointment Heatmap - ALL ROLES
router.get("/appointment-heatmap", authorize(Role.MANAGER, Role.DOCTOR, Role.ASSISTANT), ReportController.getAppointmentHeatmap);

// ============================================
// FRIEND'S ROUTES (9 items) - TODO
// ============================================

// TODO: 1. Upcoming Appointments (7 days) - ASSISTANT
// router.get("/upcoming-appointments", authorize(Role.ASSISTANT), ReportController.getUpcomingAppointments);

// TODO: 2. New Patients This Month - ASSISTANT
// router.get("/new-patients", authorize(Role.ASSISTANT), ReportController.getNewPatientsThisMonth);

// TODO: 3. Today's Appointments - ASSISTANT
// router.get("/todays-appointments", authorize(Role.ASSISTANT), ReportController.getTodaysAppointments);

// TODO: 4. Treatments Performed - DOCTOR
// router.get("/treatments-performed", authorize(Role.DOCTOR), ReportController.getTreatmentsPerformed);

// TODO: 5. Payment Status - MANAGER
// router.get("/payment-status", authorize(Role.MANAGER), ReportController.getPaymentStatus);

// TODO: 6. Patient Demographics - MANAGER
// router.get("/patient-demographics", authorize(Role.MANAGER), ReportController.getPatientDemographics);

// TODO: 7. Revenue Generated - DOCTOR/MANAGER
// router.get("/revenue-generated", authorize(Role.MANAGER, Role.DOCTOR), ReportController.getRevenueGenerated);

// TODO: 8. Total Revenue Trend - MANAGER
// router.get("/revenue-trend", authorize(Role.MANAGER), ReportController.getTotalRevenueTrend);

// TODO: 9. Staff Performance - MANAGER
// router.get("/staff-performance", authorize(Role.MANAGER), ReportController.getStaffPerformance);
// ============================================
// FRIEND'S ROUTES (9 items)
// ============================================

// 1. Upcoming Appointments (7 days) - ASSISTANT
router.get("/upcoming-appointments", authorize(Role.ASSISTANT), ReportController.getUpcomingAppointments);

// 2. New Patients This Month - ASSISTANT
// Allow ASSISTANT, MANAGER, or whoever needs access
router.get("/new-patients", authorize(Role.ASSISTANT, Role.MANAGER, Role.DOCTOR), ReportController.getNewPatientsThisMonth);
// 3. Today's Appointments - ASSISTANT
router.get("/todays-appointments", authorize(Role.ASSISTANT), ReportController.getTodaysAppointments);

// 4. Treatments Performed - DOCTOR
router.get("/treatments-performed", authorize(Role.DOCTOR), ReportController.getTreatmentsPerformed);

// 5. Payment Status - MANAGER
router.get("/payment-status", authorize(Role.MANAGER), ReportController.getPaymentStatus);

// 6. Patient Demographics - MANAGER
router.get("/patient-demographics", authorize(Role.MANAGER), ReportController.getPatientDemographics);

// 7. Revenue Generated - DOCTOR/MANAGER
router.get("/revenue-generated", authorize(Role.MANAGER, Role.DOCTOR), ReportController.getRevenueGenerated);

// 8. Total Revenue Trend - MANAGER
router.get("/revenue-trend", authorize(Role.MANAGER), ReportController.getTotalRevenueTrend);

// 9. Staff Performance - MANAGER
router.get("/staff-performance", authorize(Role.MANAGER), ReportController.getStaffPerformance);
export default router;