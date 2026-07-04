import { Response } from "express";
import { RoomService } from "../services/room.service";
import { sendSuccess } from "../utils/response.utils";
import { asyncHandler } from "../utils/async.handler";
import { AuthenticatedRequest } from "../types/auth.types";

export class RoomController {
    static getAll = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
        const rooms = await RoomService.getAllRooms();
        sendSuccess(res, rooms);
    });
}
