import { Response } from "express";
import { PaymentService } from "../services/payment.service";
import { sendSuccess } from "../utils/response.utils";
import { asyncHandler } from "../utils/async.handler";
import { PaymentMethod } from "@prisma/client";
import { AuthenticatedRequest } from "../types/auth.types";

export class PaymentController {
  /**
   * Get all payments with optional filtering
   * GET /api/payments?patientId=...&method=...&dateFrom=...&dateTo=...
   */
  static getAll = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { patientId, method, dateFrom, dateTo } = req.query;

    const payments = await PaymentService.getAllPayments({
      patientId: patientId as string | undefined,
      method: method as PaymentMethod | undefined,
      dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo: dateTo ? new Date(dateTo as string) : undefined,
    }, req.user?.userId);

    sendSuccess(res, {
      payments,
      total: payments.length,
    }, "Payments retrieved successfully");
  });

  /**
   * Get a single payment by ID
   * GET /api/payments/:id
   */
  static getById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const payment = await PaymentService.getPaymentById(id, req.user?.userId);
    sendSuccess(res, payment, "Payment retrieved successfully");
  });

  /**
   * Get all payments for a specific patient
   * GET /api/payments/patient/:patientId
   */
  static getByPatient = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { patientId } = req.params;
    const payments = await PaymentService.getPaymentsByPatient(patientId, req.user?.userId);
    
    sendSuccess(res, {
      payments,
      total: payments.length,
    }, "Patient payments retrieved successfully");
  });

  /**
   * Create a new payment
   * POST /api/payments
   */
  static create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { patientId, date, amount, method, notes } = req.body;

    // Validate required fields
    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: "Patient ID is required",
      });
    }

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Amount is required",
      });
    }

    if (!method) {
      return res.status(400).json({
        success: false,
        message: "Payment method is required",
      });
    }

    // Validate payment method is valid enum value
    if (!Object.values(PaymentMethod).includes(method)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment method. Valid methods are: ${Object.values(PaymentMethod).join(", ")}`,
      });
    }

    const payment = await PaymentService.createPayment({
      patientId,
      recordedById: req.user?.userId,
      date: date ? new Date(date) : undefined,
      amount,
      method,
      notes,
    });

    sendSuccess(res, payment, "Payment created successfully", 201);
  });

  /**
   * Update an existing payment
   * PUT /api/payments/:id
   */
  static update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { patientId, date, amount, method, notes } = req.body;

    // Validate payment method if provided
    if (method && !Object.values(PaymentMethod).includes(method)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment method. Valid methods are: ${Object.values(PaymentMethod).join(", ")}`,
      });
    }

    const updateData: any = {};
    if (patientId) updateData.patientId = patientId;
    if (date) updateData.date = new Date(date);
    if (amount !== undefined) updateData.amount = amount;
    if (method) updateData.method = method;
    if (notes !== undefined) updateData.notes = notes;

    const payment = await PaymentService.updatePayment(id, updateData, req.user?.userId);
    sendSuccess(res, payment, "Payment updated successfully");
  });

  /**
   * Delete a payment
   * DELETE /api/payments/:id
   */
  static delete = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const result = await PaymentService.deletePayment(id, req.user?.userId);
    sendSuccess(res, result, "Payment deleted successfully");
  });

  /**
   * Search payments by keyword
   * GET /api/payments/search?q=...
   */
  static search = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { q } = req.query;

    if (!q || typeof q !== "string") {
      return res.status(400).json({
        success: false,
        message: "Search query parameter 'q' is required",
      });
    }

    const payments = await PaymentService.searchPayments(q, req.user?.userId);
    
    sendSuccess(res, {
      payments,
      total: payments.length,
      query: q,
    }, "Search completed successfully");
  });

  /**
   * Get payment statistics for a patient
   * GET /api/payments/stats/:patientId
   */
  static getStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { patientId } = req.params;
    const stats = await PaymentService.getPaymentStats(patientId, req.user?.userId);
    sendSuccess(res, stats, "Payment statistics retrieved successfully");
  });
}