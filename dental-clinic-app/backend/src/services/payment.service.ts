import { PaymentMethod } from "../types/prisma.types";
import { Prisma } from "@prisma/client";
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

        // Validate patient exists
        const patient = await prisma.patient.findUnique({
            where: { id: data.patientId },
        });

        if (!patient) {
            throw new NotFoundError("Patient not found");
        }

        // Validate amount is positive
        const amount = typeof data.amount === "string" 
            ? parseFloat(data.amount) 
            : data.amount;

        if (isNaN(amount) || amount <= 0) {
            throw new ValidationError("Amount must be a positive number");
        }

        // Validate recorded by user exists
        const user = await prisma.user.findUnique({
            where: { id: data.recordedById },
        });

        if (!user) {
            throw new NotFoundError("Recorded by user not found");
        }

        const payment = await prisma.payment.create({
            data: {
                patientId: data.patientId,
                amount: new Prisma.Decimal(amount),
                method: data.method,
                notes: data.notes,
                date: data.date || new Date(),
                recordedById: data.recordedById,
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                },
                recordedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
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

        // Verify patient exists
        const patient = await prisma.patient.findUnique({
            where: { id: patientId },
        });

        if (!patient) {
            throw new NotFoundError("Patient not found");
        }

        const payments = await prisma.payment.findMany({
            where: { patientId },
            include: {
                patient: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                },
                recordedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
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

        // Verify payment exists
        const existingPayment = await prisma.payment.findUnique({
            where: { id },
        });

        if (!existingPayment) {
            throw new NotFoundError("Payment not found");
        }

        // Validate patient exists if patientId is being updated
        if (data.patientId) {
            const patient = await prisma.patient.findUnique({
                where: { id: data.patientId },
            });

            if (!patient) {
                throw new NotFoundError("Patient not found");
            }
        }

        // Validate amount if provided
        if (data.amount !== undefined) {
            const amount = typeof data.amount === "string" 
                ? parseFloat(data.amount) 
                : data.amount;

            if (isNaN(amount) || amount <= 0) {
                throw new ValidationError("Amount must be a positive number");
            }

            data.amount = amount;
        }

        const updateData: any = {
            ...(data.patientId && { patientId: data.patientId }),
            ...(data.date && { date: data.date }),
            ...(data.amount && { amount: new Prisma.Decimal(data.amount) }),
            ...(data.method && { method: data.method }),
            ...(data.notes !== undefined && { notes: data.notes }),
        };

        const payment = await prisma.payment.update({
            where: { id },
            data: updateData,
            include: {
                patient: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                },
                recordedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
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

        // Verify payment exists
        const existingPayment = await prisma.payment.findUnique({
            where: { id },
        });

        if (!existingPayment) {
            throw new NotFoundError("Payment not found");
        }

        await prisma.payment.delete({
            where: { id },
        });

        return { message: "Payment deleted successfully", id };
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

        if (!query || query.trim().length === 0) {
            return [];
        }

        const searchTerm = query.trim();

        // Check if search term matches any PaymentMethod enum value
        const matchingMethods = Object.values(PaymentMethod).filter(method =>
            method.toUpperCase().includes(searchTerm.toUpperCase())
        );

        const payments = await prisma.payment.findMany({
            where: {
                OR: [
                    {
                        patient: {
                            OR: [
                                { firstName: { contains: searchTerm, mode: "insensitive" } },
                                { lastName: { contains: searchTerm, mode: "insensitive" } },
                                { email: { contains: searchTerm, mode: "insensitive" } },
                            ],
                        },
                    },
                    { notes: { contains: searchTerm, mode: "insensitive" } },
                    ...(matchingMethods.length > 0 ? [{ method: { in: matchingMethods } }] : []),
                ],
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                },
                recordedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
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
                patient: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                },
                recordedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
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
                patient: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                },
                recordedBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
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
