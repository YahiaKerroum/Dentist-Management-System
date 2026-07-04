import { Response } from "express";
import { TreatmentService } from "../services/treatment.service";
import { sendSuccess } from "../utils/response.utils";
import { asyncHandler } from "../utils/async.handler";
import { AuthenticatedRequest } from "../types/auth.types";

export class TreatmentController {
    static create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const treatment = await TreatmentService.createTreatment({
            ...req.body,
            createdByUserId: req.user?.userId,
        });
        sendSuccess(res, treatment, "Treatment created successfully", 201);
    });

    static getAll = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const { doctorId, patientId, status, dateFrom, dateTo } = req.query;

        const treatments = await TreatmentService.getAllTreatments(
            {
                doctorId: doctorId as string | undefined,
                patientId: patientId as string | undefined,
                status: status as any,
                dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
                dateTo: dateTo ? new Date(dateTo as string) : undefined,
            },
            req.user?.userId
        );

        sendSuccess(res, treatments);
    });

    static getById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const treatment = await TreatmentService.getTreatmentById(req.params.id, req.user?.userId);
        sendSuccess(res, treatment);
    });

    static update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const treatment = await TreatmentService.updateTreatment(
            req.params.id,
            req.body,
            req.user?.userId
        );
        sendSuccess(res, treatment, "Treatment updated successfully");
    });

    static updateStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const treatment = await TreatmentService.updateTreatmentStatus(
            req.params.id,
            req.body.status,
            req.user?.userId
        );
        sendSuccess(res, treatment, "Treatment status updated");
    });

    static delete = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        await TreatmentService.deleteTreatment(
            req.params.id,
            req.user?.userId
        );
        sendSuccess(res, null, "Treatment deleted successfully");
    });
}
