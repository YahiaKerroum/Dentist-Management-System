import { TreatmentType } from "../types/prisma.types";
import { NotFoundError, ForbiddenError, ValidationError } from "../errors/app.errors";
import prisma from "../config/prisma";
import { userHasPermission } from "../utils/permission.utils";
import { Permission } from "../types/permission.types";



export class TreatmentService {
    static async createTreatment(data: {
        doctorId: string;
        patientId: string;
        dateOfTreatment: Date;
        typeOfTreatment: TreatmentType;
        notes?: string;
        procedure?: string;
        teethInvolved?: number[];
        followUpRequired?: boolean;
        appointmentId?: string;
        createdByUserId?: string;
    }) {
        // check if the user trying to create treatment has the permission to create treatment
        if (!data.createdByUserId) {
            throw new ValidationError("createdByUserId is required to create a treatment");
        }

        const hasCreatePermission = await userHasPermission(
            data.createdByUserId,
            Permission.TREATMENTS_CREATE
        );

        if (!hasCreatePermission) {
            throw new ForbiddenError("You do not have permission to create treatments");
        }

        const treatment = await prisma.treatment.create({
            data: {
                doctorId: data.doctorId,
                patientId: data.patientId,
                dateOfTreatment: data.dateOfTreatment,
                typeOfTreatment: data.typeOfTreatment,
                notes: data.notes,
                procedure: data.procedure,
                teethInvolved: data.teethInvolved || [],
                followUpRequired: data.followUpRequired || false,
                appointmentId: data.appointmentId,
                completed: false,
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

        return treatment;
    }

    static async getAllTreatments(filters?: {
        doctorId?: string;
        patientId?: string;
        completed?: boolean;
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

        if (filters?.completed !== undefined) {
            where.completed = filters.completed;
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

        const treatments = await prisma.treatment.findMany({
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
                dateOfTreatment: "desc",
            },
        });

        return treatments;
    }

    static async getTreatmentById(id: string) {
        const treatment = await prisma.treatment.findUnique({
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
                appointment: true,
            },
        });

        if (!treatment) {
            throw new NotFoundError("Treatment not found");
        }

        return treatment;
    }

    static async updateTreatment(
        id: string,
        data: {
            notes?: string;
            procedure?: string;
            teethInvolved?: number[];
            followUpRequired?: boolean;
        },
        actorUserId?: string
    ) {
        if (!actorUserId) {
            throw new ValidationError("actorUserId is required to update a treatment");
        }

        const hasUpdatePermission = await userHasPermission(
            actorUserId,
            Permission.TREATMENTS_UPDATE
        );

        if (!hasUpdatePermission) {
            throw new ForbiddenError("You do not have permission to update treatments");
        }

        await this.getTreatmentById(id);

        const treatment = await prisma.treatment.update({
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

        return treatment;
    }

    static async markAsCompleted(id: string, actorUserId?: string) {
        if (!actorUserId) {
            throw new ValidationError("actorUserId is required to mark treatment as completed");
        }

        const hasUpdatePermission = await userHasPermission(
            actorUserId,
            Permission.TREATMENTS_UPDATE
        );

        if (!hasUpdatePermission) {
            throw new ForbiddenError("You do not have permission to update treatments");
        }

        await this.getTreatmentById(id);

        const treatment = await prisma.treatment.update({
            where: { id },
            data: { completed: true },
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

        return treatment;
    }

    static async deleteTreatment(id: string, actorUserId?: string) {
        if (!actorUserId) {
            throw new ValidationError("actorUserId is required to delete a treatment");
        }

        const hasDeletePermission = await userHasPermission(
            actorUserId,
            Permission.TREATMENTS_DELETE
        );

        if (!hasDeletePermission) {
            throw new ForbiddenError("You do not have permission to delete treatments");
        }

        await this.getTreatmentById(id);

        await prisma.treatment.delete({
            where: { id },
        });

        return { message: "Treatment deleted successfully" };
    }
}
