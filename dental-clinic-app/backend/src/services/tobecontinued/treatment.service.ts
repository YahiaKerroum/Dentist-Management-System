import { TreatmentType } from "../../types/prisma.types";
import { NotFoundError } from "../../errors/app.errors";
import prisma from "../../config/prisma";



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
    }) {
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
        }
    ) {
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

    static async markAsCompleted(id: string) {
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
}
