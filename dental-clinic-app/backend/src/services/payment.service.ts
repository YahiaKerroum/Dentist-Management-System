import { PaymentMethod } from "../types/prisma.types";
import { NotFoundError, ForbiddenError, ValidationError } from "../errors/app.errors";
import prisma from "../config/prisma";
import { userHasPermission } from "../utils/permission.utils";
import { Permission } from "../types/permission.types";



export class PaymentService {
    static async createPayment(data: {
        patientId: string;
        amount: number;
        method: PaymentMethod;
        notes?: string;
        date?: Date;
        recordedById?: string;
    }) {
        if (!data.recordedById) {
            throw new ValidationError("recordedById is required to create a payment");
        }

        const hasCreatePermission = await userHasPermission(
            data.recordedById,
            Permission.PAYMENT_CREATE
        );

        if (!hasCreatePermission) {
            throw new ForbiddenError("You do not have permission to create payments");
        }

        const payment = await prisma.payment.create({
            data: {
                patientId: data.patientId,
                amount: data.amount,
                method: data.method,
                notes: data.notes,
                date: data.date,
                recordedById: data.recordedById,
            },
            include: {
                patient: true,
                recordedBy: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        return payment;
    }

    static async getPaymentsByPatient(patientId: string, actorUserId?: string) {
        if (!actorUserId) {
            throw new ValidationError("actorUserId is required to view payments");
        }

        const hasViewPermission = await userHasPermission(
            actorUserId,
            Permission.PAYMENT_VIEW
        );

        if (!hasViewPermission) {
            throw new ForbiddenError("You do not have permission to view payments");
        }

        const payments = await prisma.payment.findMany({
            where: { patientId },
            include: {
                patient: true,
                recordedBy: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: { date: "desc" },
        });

        return payments;
    }

    static async updatePayment(
        id: string,
        data: {
            patientId?: string;
            date?: Date;
            amount?: number;
            method?: PaymentMethod;
            notes?: string;
        },
        actorUserId?: string
    ) {
        if (!actorUserId) {
            throw new ValidationError("actorUserId is required to update a payment");
        }

        const hasUpdatePermission = await userHasPermission(
            actorUserId,
            Permission.PAYMENT_UPDATE
        );

        if (!hasUpdatePermission) {
            throw new ForbiddenError("You do not have permission to update payments");
        }

        await this.getPaymentById(id, actorUserId);

        const payment = await prisma.payment.update({
            where: { id },
            data,
            include: {
                patient: true,
                recordedBy: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        return payment;
    }

    static async deletePayment(id: string, actorUserId?: string) {
        if (!actorUserId) {
            throw new ValidationError("actorUserId is required to delete a payment");
        }

        const hasDeletePermission = await userHasPermission(
            actorUserId,
            Permission.PAYMENT_DELETE
        );

        if (!hasDeletePermission) {
            throw new ForbiddenError("You do not have permission to delete payments");
        }

        await this.getPaymentById(id, actorUserId);

        await prisma.payment.delete({
            where: { id },
        });

        return { message: "Payment deleted successfully" };
    }

    static async searchPayments(query: string, actorUserId?: string) {
        if (!actorUserId) {
            throw new ValidationError("actorUserId is required to search payments");
        }

        const hasViewPermission = await userHasPermission(
            actorUserId,
            Permission.PAYMENT_VIEW
        );

        if (!hasViewPermission) {
            throw new ForbiddenError("You do not have permission to view payments");
        }

        const payments = await prisma.payment.findMany({
            where: {
                OR: [
                    { notes: { contains: query, mode: "insensitive" } },
                ],
            },
            include: {
                patient: true,
                recordedBy: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: { date: "desc" },
        });

        return payments;
    }

    static async getPaymentStats(patientId: string, actorUserId?: string) {
        if (!actorUserId) {
            throw new ValidationError("actorUserId is required to view payment stats");
        }

        const hasViewPermission = await userHasPermission(
            actorUserId,
            Permission.PAYMENT_VIEW
        );

        if (!hasViewPermission) {
            throw new ForbiddenError("You do not have permission to view payments");
        }

        const [totalCount, totalAmount, byMethod] = await Promise.all([
            prisma.payment.count({ where: { patientId } }),
            prisma.payment.aggregate({
                where: { patientId },
                _sum: { amount: true },
            }),
            prisma.payment.groupBy({
                by: ["method"],
                where: { patientId },
                _sum: { amount: true },
                _count: { _all: true },
            }),
        ]);

        return {
            totalPayments: totalCount,
            totalAmount: Number(totalAmount._sum.amount) || 0,
            byMethod: byMethod.map((m) => ({
                method: m.method,
                totalAmount: Number(m._sum.amount) || 0,
                count: m._count._all,
            })),
        };
    }

    static async getAllPayments(
        filters: {
            patientId?: string;
            method?: PaymentMethod;
            dateFrom?: Date;
            dateTo?: Date;
        } = {},
        actorUserId?: string
    ) {
        if (!actorUserId) {
            throw new ValidationError("actorUserId is required to view payments");
        }

        const hasViewPermission = await userHasPermission(
            actorUserId,
            Permission.PAYMENT_VIEW
        );

        if (!hasViewPermission) {
            throw new ForbiddenError("You do not have permission to view payments");
        }

        const where: any = {};

        if (filters?.patientId) {
            where.patientId = filters.patientId;
        }

        if (filters?.method) {
            where.method = filters.method;
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

        const payments = await prisma.payment.findMany({
            where,
            include: {
                patient: true,
                recordedBy: {
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

        return payments;
    }

    static async getPaymentById(id: string, actorUserId?: string) {
        if (!actorUserId) {
            throw new ValidationError("actorUserId is required to view a payment");
        }

        const hasViewPermission = await userHasPermission(
            actorUserId,
            Permission.PAYMENT_VIEW
        );

        if (!hasViewPermission) {
            throw new ForbiddenError("You do not have permission to view payments");
        }

        const payment = await prisma.payment.findUnique({
            where: { id },
            include: {
                patient: true,
                recordedBy: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        if (!payment) {
            throw new NotFoundError("Payment not found");
        }

        return payment;
    }

    static async getTotalRevenue(
        filters: { dateFrom?: Date; dateTo?: Date } = {},
        actorUserId?: string
    ) {
        if (!actorUserId) {
            throw new ValidationError("actorUserId is required to view payments totals");
        }

        const hasViewPermission = await userHasPermission(
            actorUserId,
            Permission.PAYMENT_VIEW
        );

        if (!hasViewPermission) {
            throw new ForbiddenError("You do not have permission to view payments");
        }

        const where: any = {};

        if (filters?.dateFrom || filters?.dateTo) {
            where.date = {};
            if (filters.dateFrom) {
                where.date.gte = filters.dateFrom;
            }
            if (filters.dateTo) {
                where.date.lte = filters.dateTo;
            }
        }

        const result = await prisma.payment.aggregate({
            where,
            _sum: {
                amount: true,
            },
        });

        return Number(result._sum.amount) || 0;
    }
}
