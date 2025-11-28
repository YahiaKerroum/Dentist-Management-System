import { Response } from "express";
import { AuthService } from "../services/auth.service";
import { sendSuccess } from "../utils/response.utils";
import { asyncHandler } from "../utils/async.handler";
import { AuthenticatedRequest } from "../types/auth.types";

export class AuthController {
  static login = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { username, password } = req.body;

    const result = await AuthService.login(username, password);

    sendSuccess(res, result, "Login successful");
  });

  static changePassword = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { oldPassword, newPassword } = req.body;
      const userId = req.user!.userId;

      const result = await AuthService.changePassword(userId, oldPassword, newPassword);

      sendSuccess(res, result, "Password changed successfully");
    }
  );
}
