import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { sendSuccess } from "../utils/response.utils";
import { asyncHandler } from "../utils/async.handler";
import { Role } from "@prisma/client";
import prisma from "../config/prisma";

export class UserController {
    static create = asyncHandler(async (req: Request, res: Response) => {
        const user = await UserService.createUser(req.body);
        sendSuccess(res, user, "User created successfully", 201);
    });

    static getAll = asyncHandler(async (req: Request, res: Response) => {
        const { role, search } = req.query;

        const users = await UserService.getAllUsers({
            role: role as Role | undefined,
            search: search as string | undefined,
        });

        sendSuccess(res, users);
    });

    static getById = asyncHandler(async (req: Request, res: Response) => {
        const user = await UserService.getUserById(req.params.id);
        sendSuccess(res, user);
    });

    static getMe = asyncHandler(async (req: any, res: Response) => {
        const user = await UserService.getUserById(req.user.userId);
        
        // If user is a doctor, add patient count
        if (user.role === 'DOCTOR' && user.doctorProfile) {
            const patientCount = await prisma.patient.count({
                where: { 
                    primaryDentistId: user.doctorProfile.id
                }
            });
            
            const userWithStats = {
                ...user,
                doctorProfile: {
                    ...user.doctorProfile,
                    patientCount
                }
            };
            
            sendSuccess(res, userWithStats);
        } else {
            sendSuccess(res, user);
        }
    });

    static updateMe = asyncHandler(async (req: any, res: Response) => {
        const user = await UserService.updateUser(req.user.userId, req.body);
        sendSuccess(res, user, "Profile updated successfully");
    });

    static update = asyncHandler(async (req: Request, res: Response) => {
        const user = await UserService.updateUser(req.params.id, req.body);
        sendSuccess(res, user, "User updated successfully");
    });

    static delete = asyncHandler(async (req: Request, res: Response) => {
        const result = await UserService.deleteUser(req.params.id);
        sendSuccess(res, result);
    });
}
