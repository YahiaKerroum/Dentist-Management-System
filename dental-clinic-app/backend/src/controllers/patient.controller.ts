import { Request, Response } from "express";
import { PatientService } from "../services/patient.service";
import { sendSuccess } from "../utils/response.utils";
import { asyncHandler } from "../utils/async.handler";
import { AuthenticatedRequest } from "../types/auth.types";

export class PatientController {
  static create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const patient = await PatientService.createPatient({
      ...req.body,
      registeredById: req.user?.userId,
    });
    sendSuccess(res, patient, "Patient created successfully", 201);
  });

  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const { search, primaryDentistId } = req.query;

    const patients = await PatientService.getAllPatients({
      search: search as string | undefined,
      primaryDentistId: primaryDentistId as string | undefined,
    });

    sendSuccess(res, patients);
  });

  static getById = asyncHandler(async (req: Request, res: Response) => {
    const patient = await PatientService.getPatientById(req.params.id);
    sendSuccess(res, patient);
  });

  static getHistory = asyncHandler(async (req: Request, res: Response) => {
    const history = await PatientService.getPatientHistory(req.params.id);
    sendSuccess(res, history);
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const patient = await PatientService.updatePatient(req.params.id, req.body);
    sendSuccess(res, patient, "Patient updated successfully");
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    const result = await PatientService.deletePatient(req.params.id);
    sendSuccess(res, result);
  });
}
