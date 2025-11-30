import { Request, Response } from "express";
import { TreatmentService } from "../services/tobecontinued/treatment.service";
import { sendSuccess } from "../utils/response.utils";
import { asyncHandler } from "../utils/async.handler";

export class TreatmentController {
    static create = asyncHandler(async (req: Request, res: Response) => {
        const treatment = await TreatmentService.createTreatment(req.body);
        sendSuccess(res, treatment, "Treatment created successfully", 201);
    });

    static getAll = asyncHandler(async (req: Request, res: Response) => {
        const { doctorId, patientId, completed, dateFrom, dateTo } = req.query;

        const treatments = await TreatmentService.getAllTreatments({
            doctorId: doctorId as string | undefined,
            patientId: patientId as string | undefined,
            completed: completed === "true" ? true : completed === "false" ? false : undefined,
            dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
            dateTo: dateTo ? new Date(dateTo as string) : undefined,
        });

        sendSuccess(res, treatments);
    });

    static getById = asyncHandler(async (req: Request, res: Response) => {
        const treatment = await TreatmentService.getTreatmentById(req.params.id);
        sendSuccess(res, treatment);
    });

    static update = asyncHandler(async (req: Request, res: Response) => {
        const treatment = await TreatmentService.updateTreatment(req.params.id, req.body);
        sendSuccess(res, treatment, "Treatment updated successfully");
    });

    static markCompleted = asyncHandler(async (req: Request, res: Response) => {
        const treatment = await TreatmentService.markAsCompleted(req.params.id);
        sendSuccess(res, treatment, "Treatment marked as completed");
    });
}
