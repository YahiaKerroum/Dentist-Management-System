import { Request, Response } from "express";
import { ExpenseService } from "../services/tobecontinued/expense.service";
import { sendSuccess } from "../utils/response.utils";
import { asyncHandler } from "../utils/async.handler";
import { AuthenticatedRequest } from "../types/auth.types";

export class ExpenseController {
  static create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const expense = await ExpenseService.createExpense({
      ...req.body,
      recordedById: req.user?.userId,
    });
    sendSuccess(res, expense, "Expense created successfully", 201);
  });

  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const { approved, category, dateFrom, dateTo } = req.query;

    const expenses = await ExpenseService.getAllExpenses({
      approved: approved === "true" ? true : approved === "false" ? false : undefined,
      category: category as string | undefined,
      dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo: dateTo ? new Date(dateTo as string) : undefined,
    });

    sendSuccess(res, expenses);
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const expense = await ExpenseService.getExpenseById(req.params.id);
    sendSuccess(res, expense);
  });

  static approve = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const expense = await ExpenseService.approveExpense(
      req.params.id,
      req.user!.userId
    );
    sendSuccess(res, expense, "Expense approved successfully");
  });
}
