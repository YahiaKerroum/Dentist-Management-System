import prisma from "../../config/prisma";
import { PaymentService } from "./payment.service";
import { ExpenseService } from "./expense.service";

export class ReportService {

    // ============================
    // DASHBOARD STATS
    // ============================
    static async getDashboardStats() {
        const [
            totalPatients,
            totalAppointments,
            totalTreatments,
            totalRevenue,
            totalExpenses,
        ] = await Promise.all([
            prisma.patient.count(),
            prisma.appointment.count(),
            prisma.treatment.count(),
            PaymentService.getTotalRevenue(),
            ExpenseService.getTotalExpenses({ approved: true }),
        ]);

        const profit = totalRevenue - totalExpenses;

        return {
            totalPatients,
            totalAppointments,
            totalTreatments,
            totalRevenue,
            totalExpenses,
            profit,
        };
    }

    // ============================
    // APPOINTMENT STATS
    // ============================
    static async getAppointmentStats(dateFrom?: Date, dateTo?: Date) {
        const where: any = {};

        if (dateFrom || dateTo) {
            where.dateOfTreatment = {};
            if (dateFrom) where.dateOfTreatment.gte = dateFrom;
            if (dateTo) where.dateOfTreatment.lte = dateTo;
        }

        const [total, byStatus, byDoctor] = await Promise.all([
            prisma.appointment.count({ where }),
            prisma.appointment.groupBy({
                by: ["status"],
                where,
                _count: true,
            }),
            prisma.appointment.groupBy({
                by: ["doctorId"],
                where,
                _count: true,
            }),
        ]);

        const statusCounts = byStatus.reduce((acc, item) => {
            acc[item.status] = item._count;
            return acc;
        }, {} as Record<string, number>);

        return {
            total,
            byStatus: statusCounts,
            totalByDoctor: byDoctor.length,
        };
    }

    // ============================
    // PATIENT STATS
    // ============================
    static async getPatientStats() {
        const [total, newThisMonth, withAppointments] = await Promise.all([
            prisma.patient.count(),
            prisma.patient.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    },
                },
            }),
            prisma.patient.count({
                where: {
                    appointments: { some: {} },
                },
            }),
        ]);

        return {
            total,
            newThisMonth,
            withAppointments,
            withoutAppointments: total - withAppointments,
        };
    }
}
