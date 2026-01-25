import { NotFoundError, ForbiddenError, ValidationError } from "../errors/app.errors";
import prisma from "../config/prisma";
import { userHasPermission } from "../utils/permission.utils";
import { Permission } from "../types/permission.types";


export class ExpenseService {
    
    static async createExpense(data: {
        category: string;
        paidTo: string;
        amount: number;
        notes?: string;
        recordedById?: string;
    }) {
        if (!data.recordedById) {
            throw new ValidationError("recordedById is required to create an expense");
        }

        const hasCreatePermission = await userHasPermission(
            data.recordedById,
            Permission.EXPENSES_CREATE
        );

        if (!hasCreatePermission) {
            throw new ForbiddenError("You do not have permission to create expenses");
        }

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

    static async getAllExpenses(
      filters: {
        approved?: boolean;
        category?: string;
        dateFrom?: Date;
        dateTo?: Date;
      } = {},
      actorUserId?: string
    ) {
      if (!actorUserId) {
        throw new ValidationError("actorUserId is required to view expenses");
      }

      const hasViewPermission = await userHasPermission(
        actorUserId,
        Permission.EXPENSES_VIEW
      );

      if (!hasViewPermission) {
        throw new ForbiddenError("You do not have permission to view expenses");
      }

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

    static async getExpenseById(id: string, actorUserId?: string) {
      if (!actorUserId) {
        throw new ValidationError("actorUserId is required to view an expense");
      }

      const hasViewPermission = await userHasPermission(
        actorUserId,
        Permission.EXPENSES_VIEW
      );

      if (!hasViewPermission) {
        throw new ForbiddenError("You do not have permission to view expenses");
      }

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
        if (!approvedById) {
            throw new ValidationError("approvedById is required to approve an expense");
        }

        const hasApprovePermission = await userHasPermission(
            approvedById,
            Permission.EXPENSES_APPROVE
        );

        if (!hasApprovePermission) {
            throw new ForbiddenError("You do not have permission to approve expenses");
        }

        const expense = await this.getExpenseById(id, approvedById);

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

    static async getTotalExpenses(
      filters: { approved?: boolean; dateFrom?: Date; dateTo?: Date } = {},
      actorUserId?: string
    ) {
      if (!actorUserId) {
        throw new ValidationError("actorUserId is required to view expenses totals");
      }

      const hasViewPermission = await userHasPermission(
        actorUserId,
        Permission.EXPENSES_VIEW
      );

      if (!hasViewPermission) {
        throw new ForbiddenError("You do not have permission to view expenses");
      }

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


//methods to be continued later 
static async updateExpense(
  id: string,
  data: {
    category?: string;
    paidTo?: string;
    amount?: number;
    date?: Date;
    notes?: string;
  },
  actorUserId?: string
) {
  if (!actorUserId) {
    throw new ValidationError("actorUserId is required to update an expense");
  }

  const hasUpdatePermission = await userHasPermission(
    actorUserId,
    Permission.EXPENSES_UPDATE
  );

  if (!hasUpdatePermission) {
    throw new ForbiddenError("You do not have permission to update expenses");
  }

  // First check if expense exists
  await this.getExpenseById(id, actorUserId);

  const updatedExpense = await prisma.expense.update({
    where: { id },
    data: {
      ...(data.category && { category: data.category }),
      ...(data.paidTo && { paidTo: data.paidTo }),
      ...(data.amount !== undefined && { amount: data.amount }),
      ...(data.date && { date: data.date }),
      ...(data.notes !== undefined && { notes: data.notes }),
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

static async deleteExpense(id: string, actorUserId?: string) {
  if (!actorUserId) {
    throw new ValidationError("actorUserId is required to delete an expense");
  }

  const hasDeletePermission = await userHasPermission(
    actorUserId,
    Permission.EXPENSES_DELETE
  );

  if (!hasDeletePermission) {
    throw new ForbiddenError("You do not have permission to delete expenses");
  }

  // First check if expense exists
  await this.getExpenseById(id, actorUserId);

  await prisma.expense.delete({
    where: { id },
  });

  return { message: "Expense deleted successfully" };
}

static async searchExpenses(query: string, actorUserId?: string) {
  if (!actorUserId) {
    throw new ValidationError("actorUserId is required to search expenses");
  }

  const hasViewPermission = await userHasPermission(
    actorUserId,
    Permission.EXPENSES_VIEW
  );

  if (!hasViewPermission) {
    throw new ForbiddenError("You do not have permission to view expenses");
  }

  const expenses = await prisma.expense.findMany({
    where: {
      OR: [
        { category: { contains: query, mode: "insensitive" } },
        { paidTo: { contains: query, mode: "insensitive" } },
        { notes: { contains: query, mode: "insensitive" } },
      ],
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
    orderBy: {
      date: "desc",
    },
  });

  return expenses;
}

}