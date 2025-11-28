import { NotFoundError, ForbiddenError } from "../../errors/app.errors";
import prisma from "../../config/prisma";


export class ExpenseService {
    static async createExpense(data: {
        category: string;
        paidTo: string;
        amount: number;
        notes?: string;
        recordedById?: string;
    }) {
        const expense = await prisma.expense.create({
            data: {
                category: data.category,
                paidTo: data.paidTo,
                amount: data.amount,
                notes: data.notes,
                recordedById: data.recordedById,
                approved: false,
            },
            include: {
                recordedBy: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        return expense;
    }

    static async getAllExpenses(filters?: {
        approved?: boolean;
        category?: string;
        dateFrom?: Date;
        dateTo?: Date;
    }) {
        const where: any = {};

        if (filters?.approved !== undefined) {
            where.approved = filters.approved;
        }

        if (filters?.category) {
            where.category = filters.category;
        }

        if (filters?.dateFrom || filters?.dateTo) {
            where.date = {};
            if (filters.dateFrom) {
                where.date.gte = filters.dateFrom;
            }
            if (filters.dateTo) {
                where.date.lte = filters.dateTo;
            }
        }

        const expenses = await prisma.expense.findMany({
            where,
            include: {
                recordedBy: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
                approvedBy: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: {
                date: "desc",
            },
        });

        return expenses;
    }

    static async getExpenseById(id: string) {
        const expense = await prisma.expense.findUnique({
            where: { id },
            include: {
                recordedBy: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
                approvedBy: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        if (!expense) {
            throw new NotFoundError("Expense not found");
        }

        return expense;
    }

    static async approveExpense(id: string, approvedById: string) {
        const expense = await this.getExpenseById(id);

        if (expense.approved) {
            throw new ForbiddenError("Expense is already approved");
        }

        const updatedExpense = await prisma.expense.update({
            where: { id },
            data: {
                approved: true,
                approvedById,
            },
            include: {
                recordedBy: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
                approvedBy: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        return updatedExpense;
    }

    static async getTotalExpenses(filters?: { approved?: boolean; dateFrom?: Date; dateTo?: Date }) {
        const where: any = {};

        if (filters?.approved !== undefined) {
            where.approved = filters.approved;
        }

        if (filters?.dateFrom || filters?.dateTo) {
            where.date = {};
            if (filters.dateFrom) {
                where.date.gte = filters.dateFrom;
            }
            if (filters.dateTo) {
                where.date.lte = filters.dateTo;
            }
        }

        const result = await prisma.expense.aggregate({
            where,
            _sum: {
                amount: true,
            },
        });

        return Number(result._sum.amount) || 0;
    }
}
