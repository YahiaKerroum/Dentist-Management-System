import { TreatmentType, TreatmentStatus } from "../types/prisma.types";
import { NotFoundError, ForbiddenError, ValidationError } from "../errors/app.errors";
import prisma from "../config/prisma";
import { userHasPermission } from "../utils/permission.utils";
import { Permission } from "../types/permission.types";

interface ToothInput {
    toothNumber: number;
    notes?: string;
}

const TEETH_INCLUDE = {
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
    teeth: true,
} as const;

export class TreatmentService {
    static async createTreatment(data: {
        doctorId: string;
        patientId: string;
        dateOfTreatment: Date;
        typeOfTreatment: TreatmentType;
        notes?: string;
        procedure?: string;
        teeth?: ToothInput[];
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
                teeth: {
                    create: (data.teeth || []).map((t) => ({
                        toothNumber: t.toothNumber,
                        notes: t.notes,
                    })),
                },
                followUpRequired: data.followUpRequired || false,
                appointmentId: data.appointmentId,
                status: TreatmentStatus.PLANNED,
            },
            include: TEETH_INCLUDE,
        });

        return treatment;
    }

    static async getAllTreatments(
        filters: {
            doctorId?: string;
            patientId?: string;
            status?: TreatmentStatus;
            dateFrom?: Date;
            dateTo?: Date;
        } | undefined,
        actorUserId?: string
    ) {
        if (!actorUserId) {
            throw new ValidationError("actorUserId is required to view treatments");
        }

        const hasViewPermission = await userHasPermission(actorUserId, Permission.TREATMENTS_VIEW);
        if (!hasViewPermission) {
            throw new ForbiddenError("You do not have permission to view treatments");
        }

        const where: any = {};

        if (filters?.doctorId) {
            where.doctorId = filters.doctorId;
        }

        if (filters?.patientId) {
            where.patientId = filters.patientId;
        }

        if (filters?.status !== undefined) {
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

        const treatments = await prisma.treatment.findMany({
            where,
            include: TEETH_INCLUDE,
            orderBy: {
                dateOfTreatment: "desc",
            },
        });

        return treatments;
    }

    static async getTreatmentById(id: string, actorUserId?: string) {
        if (actorUserId) {
            const hasViewPermission = await userHasPermission(actorUserId, Permission.TREATMENTS_VIEW);
            if (!hasViewPermission) {
                throw new ForbiddenError("You do not have permission to view treatments");
            }
        }

        const treatment = await prisma.treatment.findUnique({
            where: { id },
            include: {
                ...TEETH_INCLUDE,
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
            teeth?: ToothInput[];
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

        const { teeth, ...rest } = data;

        const treatment = await prisma.treatment.update({
            where: { id },
            data: {
                ...rest,
                ...(teeth !== undefined && {
                    teeth: {
                        deleteMany: {},
                        create: teeth.map((t) => ({ toothNumber: t.toothNumber, notes: t.notes })),
                    },
                }),
            },
            include: TEETH_INCLUDE,
        });

        return treatment;
    }

    static async updateTreatmentStatus(id: string, status: TreatmentStatus, actorUserId?: string) {
        if (!actorUserId) {
            throw new ValidationError("actorUserId is required to update treatment status");
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
            data: { status },
            include: TEETH_INCLUDE,
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
