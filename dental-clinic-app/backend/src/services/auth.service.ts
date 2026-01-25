import { comparePassword } from "../utils/password.utils";
import { signAccessToken, signRefreshToken, JWTPayload } from "../utils/jwt.utils";
import { UnauthorizedError, BadRequestError } from "../errors/app.errors";
import { hashPassword } from "../utils/password.utils";
import prisma from "../config/prisma";



export class AuthService {
    static async login(username: string, password: string) {
        const user = await prisma.user.findFirst({
            where: {
                OR: [{ username }, { email: username }],
            },
            include: {
                doctorProfile: true,
                managerProfile: true,
                assistantProfile: true,
            },
        });

        if (!user) {
            throw new UnauthorizedError("Invalid credentials");
        }

        const isPasswordValid = await comparePassword(password, user.passwordHash);

        if (!isPasswordValid) {
            throw new UnauthorizedError("Invalid credentials");
        }

        const payload: JWTPayload = {
            userId: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        };

        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);

        return {
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                username: user.username,
                role: user.role,
                profile: user.doctorProfile || user.managerProfile || user.assistantProfile,
            },
            accessToken,
            refreshToken,
        };
    }

    static async changePassword(userId: string, oldPassword: string, newPassword: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new UnauthorizedError("User not found");
        }

        const isPasswordValid = await comparePassword(oldPassword, user.passwordHash);

        if (!isPasswordValid) {
            throw new BadRequestError("Current password is incorrect");
        }

        const hashedPassword = await hashPassword(newPassword);

        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash: hashedPassword },
        });

        return { message: "Password changed successfully" };
    }
}
