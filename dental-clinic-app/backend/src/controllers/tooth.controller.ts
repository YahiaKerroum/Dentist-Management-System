import { Response } from "express";
import { ToothService } from "../services/tooth.service";
import { sendSuccess } from "../utils/response.utils";
import { asyncHandler } from "../utils/async.handler";
import { AuthenticatedRequest } from "../types/auth.types";

export class ToothController {
    static getOdontogram = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const odontogram = await ToothService.getPatientOdontogram(req.params.patientId, req.user?.userId);
        sendSuccess(res, odontogram);
    });

    static upsertTooth = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const tooth = await ToothService.upsertToothStatus(
            req.params.patientId,
            Number(req.params.toothNumber),
            req.body.status,
            req.body.notes,
            req.user?.userId
        );
        sendSuccess(res, tooth, "Tooth updated successfully");
    });
}
