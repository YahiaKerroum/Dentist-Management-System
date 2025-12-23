import prisma from "../../config/prisma";
import { PaymentService } from "./payment.service";
import { ExpenseService } from "./expense.service";

export class ReportService {

    // ============================
    // DASHBOARD STATS (Existing)
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
    // APPOINTMENT STATS (Existing)
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
    // PATIENT STATS (Existing)
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

    // ============================
    // FINANCIAL REPORT (Existing)
    // ============================
    static async getFinancialReport(dateFrom?: Date, dateTo?: Date) {
        const filters = { dateFrom, dateTo };

        const [revenue, expenses] = await Promise.all([
            PaymentService.getTotalRevenue(filters),
            ExpenseService.getTotalExpenses({ approved: true, ...filters }),
        ]);

        return {
            revenue,
            expenses,
            profit: revenue - expenses,
            period: {
                from: dateFrom ?? null,
                to: dateTo ?? null,
            },
        };
    }

    // ============================================
    // YOUR REPORTS (9 items) - NEW
    // ============================================

    // 1. My Patients Count - DOCTOR (Stat Card)
    static async getMyPatientsCount(doctorUserId: string) {
        const doctor = await prisma.doctor.findUnique({
            where: { userId: doctorUserId },
        });

        if (!doctor) {
            return { count: 0 };
        }

        const count = await prisma.patient.count({
            where: { primaryDentistId: doctor.id },
        });

        return { count };
    }

    // 2. Total Patients - MANAGER (Stat Card)
    static async getTotalPatients() {
        const count = await prisma.patient.count();

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const newThisMonth = await prisma.patient.count({
            where: {
                createdAt: { gte: startOfMonth },
            },
        });

        return {
            total: count,
            newThisMonth,
        };
    }

    // 3. My Appointments Today/This Week - DOCTOR (Table)
    static async getMyAppointments(doctorUserId: string, period: 'today' | 'week' = 'today') {
        const doctor = await prisma.doctor.findUnique({
            where: { userId: doctorUserId },
        });

        if (!doctor) {
            return { appointments: [], count: 0 };
        }

        const now = new Date();
        let startDate: Date;
        let endDate: Date;

        if (period === 'today') {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        } else {
            const dayOfWeek = now.getDay();
            const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);
            endDate.setHours(23, 59, 59);
        }

        const appointments = await prisma.appointment.findMany({
            where: {
                doctorId: doctor.id,
                dateOfTreatment: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                patient: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                    },
                },
            },
            orderBy: {
                dateOfTreatment: 'asc',
            },
        });

        return {
            appointments,
            count: appointments.length,
            period,
            startDate,
            endDate,
        };
    }

    // 4. Cancellations Today/This Week - ASSISTANT (Stat Card + Table)
    static async getCancellations(period: 'today' | 'week' = 'today') {
        const now = new Date();
        let startDate: Date;
        let endDate: Date;

        if (period === 'today') {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        } else {
            const dayOfWeek = now.getDay();
            const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday);
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);
            endDate.setHours(23, 59, 59);
        }

        const cancellations = await prisma.appointment.findMany({
            where: {
                status: 'CANCELLED',
                updatedAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                patient: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
                doctor: {
                    select: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        return {
            cancellations,
            count: cancellations.length,
            period,
        };
    }

    // 5. Appointments Overview - MANAGER (Pie Chart)
    static async getAppointmentsOverview(dateFrom?: Date, dateTo?: Date) {
        const where: any = {};

        if (dateFrom || dateTo) {
            where.dateOfTreatment = {};
            if (dateFrom) where.dateOfTreatment.gte = dateFrom;
            if (dateTo) where.dateOfTreatment.lte = dateTo;
        }

        const [scheduled, completed, cancelled, noShow] = await Promise.all([
            prisma.appointment.count({ where: { ...where, status: 'SCHEDULED' } }),
            prisma.appointment.count({ where: { ...where, status: 'COMPLETED' } }),
            prisma.appointment.count({ where: { ...where, status: 'CANCELLED' } }),
            prisma.appointment.count({ where: { ...where, status: 'NO_SHOW' } }),
        ]);

        return {
            scheduled,
            completed,
            cancelled,
            noShow,
            total: scheduled + completed + cancelled + noShow,
        };
    }

    // 6. Most Common Treatment Types - ALL ROLES (Pie Chart)
    static async getMostCommonTreatments() {
        const treatments = await prisma.treatment.groupBy({
            by: ['typeOfTreatment'],
            _count: {
                typeOfTreatment: true,
            },
            orderBy: {
                _count: {
                    typeOfTreatment: 'desc',
                },
            },
        });

        return treatments.map((t) => ({
            type: t.typeOfTreatment,
            count: t._count.typeOfTreatment,
        }));
    }

    // 7. Expenses Summary by Category - MANAGER (Bar Chart)
    static async getExpensesByCategory(dateFrom?: Date, dateTo?: Date) {
        const where: any = {};

        if (dateFrom || dateTo) {
            where.date = {};
            if (dateFrom) where.date.gte = dateFrom;
            if (dateTo) where.date.lte = dateTo;
        }

        const expenses = await prisma.expense.groupBy({
            by: ['category'],
            where,
            _sum: {
                amount: true,
            },
            _count: {
                category: true,
            },
            orderBy: {
                _sum: {
                    amount: 'desc',
                },
            },
        });

        const totalExpenses = await prisma.expense.aggregate({
            where,
            _sum: {
                amount: true,
            },
        });

        return {
            byCategory: expenses.map((e) => ({
                category: e.category,
                total: Number(e._sum.amount) || 0,
                count: e._count.category,
            })),
            totalAmount: Number(totalExpenses._sum.amount) || 0,
        };
    }

    // 8. Expense Trends Chart - MANAGER (Line Chart)
    static async getExpenseTrends(months: number = 6) {
        const trends: { month: string; total: number }[] = [];
        const now = new Date();

        for (let i = months - 1; i >= 0; i--) {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

            const result = await prisma.expense.aggregate({
                where: {
                    date: {
                        gte: startOfMonth,
                        lte: endOfMonth,
                    },
                },
                _sum: {
                    amount: true,
                },
            });

            trends.push({
                month: startOfMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                total: Number(result._sum.amount) || 0,
            });
        }

        return { trends };
    }

    // 9. Appointment Heatmap - ALL ROLES (Heatmap)
    static async getAppointmentHeatmap() {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const appointments = await prisma.appointment.findMany({
            where: {
                dateOfTreatment: {
                    gte: threeMonthsAgo,
                },
            },
            select: {
                dateOfTreatment: true,
            },
        });

        const heatmap: { day: number; hour: number; count: number }[] = [];

        for (let day = 0; day < 7; day++) {
            for (let hour = 8; hour <= 18; hour++) {
                heatmap.push({ day, hour, count: 0 });
            }
        }

        appointments.forEach((apt) => {
            const date = new Date(apt.dateOfTreatment);
            const day = date.getDay();
            const hour = date.getHours();

            if (hour >= 8 && hour <= 18) {
                const index = heatmap.findIndex((h) => h.day === day && h.hour === hour);
                if (index !== -1) {
                    heatmap[index].count++;
                }
            }
        });

        return { heatmap };
    }

    // ============================================
    // FRIEND'S REPORTS (9 items) - TODO
    // ============================================

    // TODO: 1. Upcoming Appointments (7 days) - ASSISTANT - Stat Card
    // static async getUpcomingAppointments() { }

    // TODO: 2. New Patients This Month - ASSISTANT - Stat Card
    // static async getNewPatientsThisMonth() { }

    // TODO: 3. Today's Appointments - ASSISTANT - Table
    // static async getTodaysAppointments() { }

    // TODO: 4. Treatments Performed - DOCTOR - Pie Chart
    // static async getTreatmentsPerformed(doctorUserId: string) { }

    // TODO: 5. Payment Status - MANAGER - Pie Chart
    // static async getPaymentStatus() { }

    // TODO: 6. Patient Demographics - MANAGER - Pie Charts
    // static async getPatientDemographics() { }

    // TODO: 7. Revenue Generated - DOCTOR/MANAGER - Line Chart
    // static async getRevenueGenerated(doctorUserId?: string) { }

    // TODO: 8. Total Revenue Trend - MANAGER - Line Chart
    // static async getTotalRevenueTrend(months: number) { }

    // TODO: 9. Staff Performance - MANAGER - Bar Chart
    // static async getStaffPerformance() { }
}