import { ToothStatus } from "../types/prisma.types";
import { ForbiddenError, ValidationError } from "../errors/app.errors";
import prisma from "../config/prisma";
import { userHasPermission } from "../utils/permission.utils";
import { Permission } from "../types/permission.types";

export class ToothService {
    static async getPatientOdontogram(patientId: string, actorUserId?: string) {
        if (!actorUserId) {
            throw new ValidationError("actorUserId is required to view the odontogram");
        }

        const hasViewPermission = await userHasPermission(actorUserId, Permission.TREATMENTS_VIEW);
        if (!hasViewPermission) {
            throw new ForbiddenError("You do not have permission to view treatments");
        }

        return prisma.patientTooth.findMany({
            where: { patientId },
            orderBy: { toothNumber: "asc" },
        });
    }

    static async upsertToothStatus(
        patientId: string,
        toothNumber: number,
        status: ToothStatus,
        notes: string | undefined,
        actorUserId?: string
    ) {
        if (!actorUserId) {
            throw new ValidationError("actorUserId is required to update the odontogram");
        }

        const hasUpdatePermission = await userHasPermission(actorUserId, Permission.TREATMENTS_UPDATE);
        if (!hasUpdatePermission) {
            throw new ForbiddenError("You do not have permission to update treatments");
        }

        if (toothNumber < 1 || toothNumber > 32) {
            throw new ValidationError("toothNumber must be between 1 and 32");
        }

        return prisma.patientTooth.upsert({
            where: { patientId_toothNumber: { patientId, toothNumber } },
            update: { status, notes, updatedById: actorUserId },
            create: { patientId, toothNumber, status, notes, updatedById: actorUserId },
        });
    }
}
