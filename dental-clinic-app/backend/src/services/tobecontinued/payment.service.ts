import { PaymentMethod } from "../../types/prisma.types";
import { NotFoundError } from "../../errors/app.errors";
import prisma from "../../config/prisma";



export class PaymentService {
    static async createPayment(data: {
        patientId: string;
        amount: number;
        method: PaymentMethod;
        notes?: string;
        recordedById?: string;
    }) {
        const payment = await prisma.payment.create({
            data: {
                patientId: data.patientId,
                amount: data.amount,
                method: data.method,
                notes: data.notes,
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

    static async getAllPayments(filters?: {
        patientId?: string;
        method?: PaymentMethod;
        dateFrom?: Date;
        dateTo?: Date;
    }) {
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

    static async getPaymentById(id: string) {
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

    static async getTotalRevenue(filters?: { dateFrom?: Date; dateTo?: Date }) {
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
