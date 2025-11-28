import { AppointmentStatus, TreatmentType } from "../../types/prisma.types";
import { NotFoundError } from "../../errors/app.errors";
import prisma from "../../config/prisma";




export class AppointmentService {
    static async createAppointment(data: {
        doctorId: string;
        patientId: string;
        dateOfTreatment: Date;
        typeOfTreatment?: TreatmentType;
        notes?: string;
        procedure?: string;
        teethInvolved?: number[];
        followUpRequired?: boolean;
        createdByUserId?: string;
    }) {
        const appointment = await prisma.appointment.create({
            data: {
                doctorId: data.doctorId,
                patientId: data.patientId,
                dateOfTreatment: data.dateOfTreatment,
                typeOfTreatment: data.typeOfTreatment,
                notes: data.notes,
                procedure: data.procedure,
                teethInvolved: data.teethInvolved || [],
                followUpRequired: data.followUpRequired || false,
                createdByUserId: data.createdByUserId,
                status: AppointmentStatus.SCHEDULED,
            },
            include: {
                doctor: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
                patient: true,
            },
        });

        return appointment;
    }

    static async getAllAppointments(filters?: {
        doctorId?: string;
        patientId?: string;
        status?: AppointmentStatus;
        dateFrom?: Date;
        dateTo?: Date;
    }) {
        const where: any = {};

        if (filters?.doctorId) {
            where.doctorId = filters.doctorId;
        }

        if (filters?.patientId) {
            where.patientId = filters.patientId;
        }

        if (filters?.status) {
            where.status = filters.status;
        }

        if (filters?.dateFrom || filters?.dateTo) {
            where.dateOfTreatment = {};
            if (filters.dateFrom) {
                where.dateOfTreatment.gte = filters.dateFrom;
            }
            if (filters.dateTo) {
                where.dateOfTreatment.lte = filters.dateTo;
            }
        }

        const appointments = await prisma.appointment.findMany({
            where,
            include: {
                doctor: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
                patient: true,
            },
            orderBy: {
                dateOfTreatment: "asc",
            },
        });

        return appointments;
    }

    static async getAppointmentById(id: string) {
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: {
                doctor: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
                patient: true,
                createdByUser: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        if (!appointment) {
            throw new NotFoundError("Appointment not found");
        }

        return appointment;
    }

    static async updateAppointment(
        id: string,
        data: {
            dateOfTreatment?: Date;
            typeOfTreatment?: TreatmentType;
            notes?: string;
            procedure?: string;
            teethInvolved?: number[];
            followUpRequired?: boolean;
        }
    ) {
        await this.getAppointmentById(id);

        const appointment = await prisma.appointment.update({
            where: { id },
            data,
            include: {
                doctor: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
                patient: true,
            },
        });

        return appointment;
    }

    static async updateAppointmentStatus(id: string, status: AppointmentStatus) {
        await this.getAppointmentById(id);

        const appointment = await prisma.appointment.update({
            where: { id },
            data: { status },
            include: {
                doctor: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
                patient: true,
            },
        });

        return appointment;
    }

    static async deleteAppointment(id: string) {
        await this.getAppointmentById(id);

        await prisma.appointment.delete({
            where: { id },
        });

        return { message: "Appointment deleted successfully" };
    }
}
