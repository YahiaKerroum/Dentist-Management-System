import { Request, Response } from "express";
import { ReportService } from "../services/tobecontinued/report.service";
import { sendSuccess } from "../utils/response.utils";
import { asyncHandler } from "../utils/async.handler";

export class ReportController {
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
}
