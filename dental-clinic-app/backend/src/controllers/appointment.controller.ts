import { Request, Response } from "express";
import { AppointmentService } from "../services/tobecontinued/appointment.service";
import { sendSuccess } from "../utils/response.utils";
import { asyncHandler } from "../utils/async.handler";
import { AppointmentStatus } from "@prisma/client";
import { AuthenticatedRequest } from "../types/auth.types";

export class AppointmentController {
    static create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const appointment = await AppointmentService.createAppointment({
            ...req.body,
            createdByUserId: req.user?.userId,
        });
        sendSuccess(res, appointment, "Appointment created successfully", 201);
    });

    static getAll = asyncHandler(async (req: Request, res: Response) => {
        const { doctorId, patientId, status, dateFrom, dateTo } = req.query;

        const appointments = await AppointmentService.getAllAppointments({
            doctorId: doctorId as string | undefined,
            patientId: patientId as string | undefined,
            status: status as AppointmentStatus | undefined,
            dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
            dateTo: dateTo ? new Date(dateTo as string) : undefined,
        });

        sendSuccess(res, appointments);
    });

    static getById = asyncHandler(async (req: Request, res: Response) => {
        const appointment = await AppointmentService.getAppointmentById(req.params.id);
        sendSuccess(res, appointment);
    });

    static update = asyncHandler(async (req: Request, res: Response) => {
        const appointment = await AppointmentService.updateAppointment(
            req.params.id,
            req.body
        );
        sendSuccess(res, appointment, "Appointment updated successfully");
    });

    static updateStatus = asyncHandler(async (req: Request, res: Response) => {
        const { status } = req.body;
        const appointment = await AppointmentService.updateAppointmentStatus(
            req.params.id,
            status
        );
        sendSuccess(res, appointment, "Appointment status updated successfully");
    });

    static delete = asyncHandler(async (req: Request, res: Response) => {
        const result = await AppointmentService.deleteAppointment(req.params.id);
        sendSuccess(res, result);
    });
}
