import { Request, Response } from "express";
import { ReportService } from "../services/tobecontinued/report.service";
import { sendSuccess } from "../utils/response.utils";
import { asyncHandler } from "../utils/async.handler";
import { AuthenticatedRequest } from "../types/auth.types";

export class ReportController {
  // ============================
  // EXISTING ENDPOINTS
  // ============================

  static getDashboard = asyncHandler(async (req: Request, res: Response) => {
    const stats = await ReportService.getDashboardStats();
    sendSuccess(res, stats);
  });

  static getFinancial = asyncHandler(async (req: Request, res: Response) => {
    const { dateFrom, dateTo } = req.query;

    const report = await ReportService.getFinancialReport(
      dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo ? new Date(dateTo as string) : undefined
    );

    sendSuccess(res, report);
  });

  static getAppointments = asyncHandler(async (req: Request, res: Response) => {
    const { dateFrom, dateTo } = req.query;

    const stats = await ReportService.getAppointmentStats(
      dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo ? new Date(dateTo as string) : undefined
    );

    sendSuccess(res, stats);
  });

  static getPatients = asyncHandler(async (req: Request, res: Response) => {
    const stats = await ReportService.getPatientStats();
    sendSuccess(res, stats);
  });

  // ============================================
  // YOUR NEW ENDPOINTS (9 items)
  // ============================================

  // 1. My Patients Count - DOCTOR
  static getMyPatientsCount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const data = await ReportService.getMyPatientsCount(userId);
    sendSuccess(res, data);
  });

  // 2. Total Patients - MANAGER
  static getTotalPatients = asyncHandler(async (req: Request, res: Response) => {
    const data = await ReportService.getTotalPatients();
    sendSuccess(res, data);
  });

  // 3. My Appointments Today/This Week - DOCTOR
  static getMyAppointments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    const period = (req.query.period as 'today' | 'week') || 'today';

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const data = await ReportService.getMyAppointments(userId, period);
    sendSuccess(res, data);
  });

  // 4. Cancellations Today/This Week - ASSISTANT
  static getCancellations = asyncHandler(async (req: Request, res: Response) => {
    const period = (req.query.period as 'today' | 'week') || 'today';

    const data = await ReportService.getCancellations(period);
    sendSuccess(res, data);
  });

  // 5. Appointments Overview - MANAGER
  static getAppointmentsOverview = asyncHandler(async (req: Request, res: Response) => {
    const { dateFrom, dateTo } = req.query;

    const data = await ReportService.getAppointmentsOverview(
      dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo ? new Date(dateTo as string) : undefined
    );

    sendSuccess(res, data);
  });

  // 6. Most Common Treatment Types - ALL ROLES
  static getMostCommonTreatments = asyncHandler(async (req: Request, res: Response) => {
    const data = await ReportService.getMostCommonTreatments();
    sendSuccess(res, data);
  });

  // 7. Expenses Summary by Category - MANAGER
  static getExpensesByCategory = asyncHandler(async (req: Request, res: Response) => {
    const { dateFrom, dateTo } = req.query;

    const data = await ReportService.getExpensesByCategory(
      dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo ? new Date(dateTo as string) : undefined
    );

    sendSuccess(res, data);
  });

  // 8. Expense Trends Chart - MANAGER
  static getExpenseTrends = asyncHandler(async (req: Request, res: Response) => {
    const months = parseInt(req.query.months as string) || 6;

    const data = await ReportService.getExpenseTrends(months);
    sendSuccess(res, data);
  });

  // 9. Appointment Heatmap - ALL ROLES
  static getAppointmentHeatmap = asyncHandler(async (req: Request, res: Response) => {
    const data = await ReportService.getAppointmentHeatmap();
    sendSuccess(res, data);
  });

  // ============================================
  // FRIEND'S ENDPOINTS (9 items) - TODO
  // ============================================

  // TODO: 1. Upcoming Appointments (7 days) - ASSISTANT
  // static getUpcomingAppointments = asyncHandler(async (req: Request, res: Response) => { });

  // TODO: 2. New Patients This Month - ASSISTANT
  // static getNewPatientsThisMonth = asyncHandler(async (req: Request, res: Response) => { });

  // TODO: 3. Today's Appointments - ASSISTANT
  // static getTodaysAppointments = asyncHandler(async (req: Request, res: Response) => { });

  // TODO: 4. Treatments Performed - DOCTOR
  // static getTreatmentsPerformed = asyncHandler(async (req: AuthenticatedRequest, res: Response) => { });

  // TODO: 5. Payment Status - MANAGER
  // static getPaymentStatus = asyncHandler(async (req: Request, res: Response) => { });

  // TODO: 6. Patient Demographics - MANAGER
  // static getPatientDemographics = asyncHandler(async (req: Request, res: Response) => { });

  // TODO: 7. Revenue Generated - DOCTOR/MANAGER
  // static getRevenueGenerated = asyncHandler(async (req: AuthenticatedRequest, res: Response) => { });

  // TODO: 8. Total Revenue Trend - MANAGER
  // static getTotalRevenueTrend = asyncHandler(async (req: Request, res: Response) => { });

  // TODO: 9. Staff Performance - MANAGER
  // static getStaffPerformance = asyncHandler(async (req: Request, res: Response) => { });
}