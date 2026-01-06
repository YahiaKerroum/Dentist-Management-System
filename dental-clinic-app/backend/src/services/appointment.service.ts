import { AppointmentStatus, TreatmentType } from "../types/prisma.types";
import { NotFoundError, ForbiddenError, ValidationError } from "../errors/app.errors";
import prisma from "../config/prisma";
import { userHasPermission } from "../utils/permission.utils";
import { Permission } from "../types/permission.types";




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
        if (!data.createdByUserId) {
            throw new ValidationError("createdByUserId is required to create an appointment");
        }

        const hasCreatePermission = await userHasPermission(
            data.createdByUserId,
            Permission.APPOINTMENTS_CREATE
        );

        if (!hasCreatePermission) {
            throw new ForbiddenError("You do not have permission to create appointments");
        }

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

    static async getAllAppointments(
        filters: {
            doctorId?: string;
            patientId?: string;
            status?: AppointmentStatus;
            dateFrom?: Date;
            dateTo?: Date;
        } = {},
        actorUserId?: string
    ) {
        if (!actorUserId) {
            throw new ValidationError("actorUserId is required to list appointments");
        }

        const hasViewPermission = await userHasPermission(actorUserId, Permission.APPOINTMENTS_VIEW);

        if (!hasViewPermission) {
            throw new ForbiddenError("You do not have permission to view appointments");
        }

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

    static async getAppointmentById(id: string, actorUserId?: string) {
        if (!actorUserId) {
            throw new ValidationError("actorUserId is required to view an appointment");
        }

        const hasViewPermission = await userHasPermission(actorUserId, Permission.APPOINTMENTS_VIEW);

        if (!hasViewPermission) {
            throw new ForbiddenError("You do not have permission to view appointments");
        }

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
        },
        actorUserId?: string
    ) {
        if (!actorUserId) {
            throw new ValidationError("actorUserId is required to update an appointment");
        }

        const hasUpdatePermission = await userHasPermission(
            actorUserId,
            Permission.APPOINTMENTS_UPDATE
        );

        if (!hasUpdatePermission) {
            throw new ForbiddenError("You do not have permission to update appointments");
        }

        await this.getAppointmentById(id, actorUserId);

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

    static async updateAppointmentStatus(id: string, status: AppointmentStatus, actorUserId?: string) {
        if (!actorUserId) {
            throw new ValidationError("actorUserId is required to update appointment status");
        }

        const requiredPermission = status === AppointmentStatus.CANCELLED
            ? Permission.APPOINTMENTS_CANCEL
            : Permission.APPOINTMENTS_UPDATE;

        const hasPermission = await userHasPermission(
            actorUserId,
            requiredPermission
        );

        if (!hasPermission) {
            throw new ForbiddenError(`You do not have permission to ${status === AppointmentStatus.CANCELLED ? 'cancel' : 'update'} appointments`);
        }

        await this.getAppointmentById(id, actorUserId);

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

    static async deleteAppointment(id: string, actorUserId?: string) {
        if (!actorUserId) {
            throw new ValidationError("actorUserId is required to delete an appointment");
        }

        const hasDeletePermission = await userHasPermission(
            actorUserId,
            Permission.APPOINTMENTS_CANCEL
        );

        if (!hasDeletePermission) {
            throw new ForbiddenError("You do not have permission to delete appointments");
        }

        await this.getAppointmentById(id, actorUserId);

        await prisma.appointment.delete({
            where: { id },
        });

        return { message: "Appointment deleted successfully" };
    }
}
