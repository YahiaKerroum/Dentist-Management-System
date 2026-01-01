import { PrismaClient, PaymentMethod, Prisma } from "@prisma/client";
import { ForbiddenError, ValidationError } from "../errors/app.errors";
import { userHasPermission } from "../utils/permission.utils";
import { Permission } from "../types/permission.types";

const prisma = new PrismaClient();

// Custom error class for service layer
class ServiceError extends Error {
  constructor(public message: string, public statusCode: number = 400) {
    super(message);
    this.name = "ServiceError";
  }
}

interface PaymentFilters {
  patientId?: string;
  method?: PaymentMethod;
  dateFrom?: Date;
  dateTo?: Date;
}

interface CreatePaymentData {
  patientId: string;
  recordedById?: string;
  date?: Date;
  amount: number | string;
  method: PaymentMethod;
  notes?: string;
}

interface UpdatePaymentData {
  patientId?: string;
  date?: Date;
  amount?: number | string;
  method?: PaymentMethod;
  notes?: string;
}

export class PaymentService {
  /**
   * Retrieve all payments with optional filtering
   */
  static async getAllPayments(filters: PaymentFilters = {}) {
    const { patientId, method, dateFrom, dateTo } = filters;

    const whereClause: Prisma.PaymentWhereInput = {
      ...(patientId && { patientId }),
      ...(method && { method }),
      ...(dateFrom || dateTo
        ? {
            date: {
              ...(dateFrom && { gte: dateFrom }),
              ...(dateTo && { lte: dateTo }),
            },
          }
        : {}),
    };

    const payments = await prisma.payment.findMany({
      where: whereClause,
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

  /**
   * Retrieve a single payment by ID
   */
  static async getPaymentById(id: string) {
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
      throw new ServiceError("Payment not found", 404);
    }

    return payment;
  }

  /**
   * Retrieve all payments for a specific patient
   */
  static async getPaymentsByPatient(patientId: string) {
    // Verify patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new ServiceError("Patient not found", 404);
    }

    const payments = await prisma.payment.findMany({
      where: { patientId },
      include: {
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

  /**
   * Create a new payment record
   */
  static async createPayment(data: CreatePaymentData) {
    // check if the user trying to create payment has the permission to create payment
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
      throw new ServiceError("Patient not found", 404);
    }

    // Validate amount is positive
    const amount = typeof data.amount === "string" 
      ? parseFloat(data.amount) 
      : data.amount;

    if (isNaN(amount) || amount <= 0) {
      throw new ServiceError("Amount must be a positive number", 400);
    }

    // Validate recorded by user exists (if provided)
    if (data.recordedById) {
      const user = await prisma.user.findUnique({
        where: { id: data.recordedById },
      });

      if (!user) {
        throw new ServiceError("Recorded by user not found", 404);
      }
    }

    const payment = await prisma.payment.create({
      data: {
        patientId: data.patientId,
        recordedById: data.recordedById,
        date: data.date || new Date(),
        amount: new Prisma.Decimal(amount),
        method: data.method,
        notes: data.notes,
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

  /**
   * Update an existing payment
   */
  static async updatePayment(id: string, data: UpdatePaymentData, actorUserId?: string) {
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
      throw new ServiceError("Payment not found", 404);
    }

    // Validate patient exists if patientId is being updated
    if (data.patientId) {
      const patient = await prisma.patient.findUnique({
        where: { id: data.patientId },
      });

      if (!patient) {
        throw new ServiceError("Patient not found", 404);
      }
    }

    // Validate amount if provided
    if (data.amount !== undefined) {
      const amount = typeof data.amount === "string" 
        ? parseFloat(data.amount) 
        : data.amount;

      if (isNaN(amount) || amount <= 0) {
        throw new ServiceError("Amount must be a positive number", 400);
      }

      data.amount = amount;
    }

    const updateData: Prisma.PaymentUpdateInput = {
      ...(data.patientId && { patient: { connect: { id: data.patientId } } }),
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

  /**
   * Delete a payment record
   */
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
      throw new ServiceError("Payment not found", 404);
    }

    await prisma.payment.delete({
      where: { id },
    });

    return { message: "Payment deleted successfully", id };
  }

  /**
   * Search payments by keyword
   */
  static async searchPayments(query: string) {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const searchTerm = query.trim().toUpperCase();

    // Check if search term matches any PaymentMethod enum value
    const matchingMethods = Object.values(PaymentMethod).filter(method =>
      method.toUpperCase().includes(searchTerm)
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
          ...(matchingMethods.length > 0
            ? [{ method: { in: matchingMethods } }]
            : []),
          {
            notes: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
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
      orderBy: {
        date: "desc",
      },
    });

    return payments;
  }

  /**
   * Get payment statistics for a patient
   */
  static async getPaymentStats(patientId: string) {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new ServiceError("Patient not found", 404);
    }

    const payments = await prisma.payment.findMany({
      where: { patientId },
    });

    const totalAmount = payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0
    );

    const paymentsByMethod = payments.reduce((acc, payment) => {
      acc[payment.method] = (acc[payment.method] || 0) + Number(payment.amount);
      return acc;
    }, {} as Record<string, number>);

    return {
      totalPayments: payments.length,
      totalAmount,
      paymentsByMethod,
      lastPaymentDate: payments[0]?.date || null,
    };
  }
}