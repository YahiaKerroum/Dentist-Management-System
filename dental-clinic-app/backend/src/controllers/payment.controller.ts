import { Request, Response } from "express";
import { PaymentService } from "../services/tobecontinued/payment.service";
import { sendSuccess } from "../utils/response.utils";
import { asyncHandler } from "../utils/async.handler";
import { PaymentMethod } from "@prisma/client";
import { AuthenticatedRequest } from "../types/auth.types";

export class PaymentController {
  static create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const payment = await PaymentService.createPayment({
      ...req.body,
      recordedById: req.user?.userId,
    });
    sendSuccess(res, payment, "Payment recorded successfully", 201);
  });

  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const { patientId, method, dateFrom, dateTo } = req.query;

    const payments = await PaymentService.getAllPayments({
      patientId: patientId as string | undefined,
      method: method as PaymentMethod | undefined,
      dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo: dateTo ? new Date(dateTo as string) : undefined,
    });

    sendSuccess(res, payments);
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const payment = await PaymentService.getPaymentById(req.params.id);
    sendSuccess(res, payment);
  });
}
