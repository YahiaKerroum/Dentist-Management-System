import { Role } from "../types/prisma.types";
import { hashPassword } from "../utils/password.utils";
import { NotFoundError, ConflictError } from "../errors/app.errors";
import prisma from "../config/prisma";



export class UserService {
  static async createUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    role: Role;
    phone?: string;
    specialization?: string;
    workingTime?: any;
  }) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.username }],
      },
    });

    if (existingUser) {
      throw new ConflictError("User with this email or username already exists");
    }

    const hashedPassword = await hashPassword(data.password);

    const profileData: any = {};

    if (data.role === Role.DOCTOR) {
      profileData.doctorProfile = {
        create: {
          specialization: data.specialization,
          workingTime: data.workingTime,
        },
      };
    } else if (data.role === Role.MANAGER) {
      profileData.managerProfile = {
        create: {},
      };
    } else if (data.role === Role.ASSISTANT) {
      profileData.assistantProfile = {
        create: {},
      };
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        username: data.username,
        passwordHash: hashedPassword,
        role: data.role,
        phone: data.phone,
        ...profileData,
      },
      include: {
        doctorProfile: true,
        managerProfile: true,
        assistantProfile: true,
      },
    });

    // Auto-assign role permissions to user
    try {
      const rolePermissions = await prisma.rolePermission.findMany({
        where: { role: data.role },
        include: { permission: true },
      });

      if (rolePermissions.length > 0) {
        const userPermissionsData = rolePermissions.map((rp) => ({
          userId: user.id,
          permissionId: rp.permissionId,
        }));

        await prisma.userPermission.createMany({
          data: userPermissionsData,
          skipDuplicates: true,
        });
      }
    } catch (error) {
      console.error("Error assigning role permissions to user:", error);
      // Don't fail user creation if permission assignment fails
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async getAllUsers(filters?: { role?: Role; search?: string }) {
    const where: any = {};

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: "insensitive" } },
        { lastName: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { username: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        doctorProfile: true,
        managerProfile: true,
        assistantProfile: true,
      },
    });

    return users;
  }

  static async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        doctorProfile: true,
        managerProfile: true,
        assistantProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }

  static async updateUser(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      specialization?: string;
      workingTime?: any;
    }
  ) {
    const user = await this.getUserById(id);

    const updateData: any = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
    };

    if (user.role === Role.DOCTOR && user.doctorProfile) {
      updateData.doctorProfile = {
        update: {
          specialization: data.specialization,
          workingTime: data.workingTime,
        },
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        doctorProfile: true,
        managerProfile: true,
        assistantProfile: true,
      },
    });

    return updatedUser;
  }

  static async deleteUser(id: string) {
    const user = await this.getUserById(id);

    // Delete related records in a transaction (due to foreign key constraints)
    await prisma.$transaction(async (tx) => {
      // Delete user permissions
      await tx.userPermission.deleteMany({
        where: { userId: id },
      });

      // Delete profile based on role
      if (user.role === Role.DOCTOR && user.doctorProfile) {
        // Delete doctor-related records first
        await tx.treatment.deleteMany({
          where: { doctorId: user.doctorProfile.id },
        });
        await tx.appointment.deleteMany({
          where: { doctorId: user.doctorProfile.id },
        });
        // Update patients who have this doctor as primary
        await tx.patient.updateMany({
          where: { primaryDentistId: user.doctorProfile.id },
          data: { primaryDentistId: null },
        });
        await tx.doctor.delete({
          where: { userId: id },
        });
      } else if (user.role === Role.MANAGER && user.managerProfile) {
        await tx.manager.delete({
          where: { userId: id },
        });
      } else if (user.role === Role.ASSISTANT && user.assistantProfile) {
        await tx.assistant.delete({
          where: { userId: id },
        });
      }

      // Delete audit logs for this user
      await tx.auditLog.deleteMany({
        where: { actorId: id },
      });

      // Update payments recorded by this user
      await tx.payment.updateMany({
        where: { recordedById: id },
        data: { recordedById: null },
      });

      // Update expenses
      await tx.expense.updateMany({
        where: { recordedById: id },
        data: { recordedById: null },
      });
      await tx.expense.updateMany({
        where: { approvedById: id },
        data: { approvedById: null },
      });

      // Update appointments created by this user
      await tx.appointment.updateMany({
        where: { createdByUserId: id },
        data: { createdByUserId: null },
      });

      // Update patients registered by this user
      await tx.patient.updateMany({
        where: { registeredById: id },
        data: { registeredById: null },
      });

      // Finally delete the user
      await tx.user.delete({
        where: { id },
      });
    });

    return { message: "User deleted successfully" };
  }

  static async getUserPermissions(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User not found");
    const permissions = await prisma.userPermission.findMany({
      where: { userId },
      include: { permission: true },
    });
    return permissions.map((up) => up.permission.name);
  }

  static async grantPermission(userId: string, permissionName: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User not found");

    const permission = await prisma.permission.findUnique({
      where: { name: permissionName },
    });
    if (!permission) throw new NotFoundError("Permission not found");

    await prisma.userPermission.create({
      data: { userId, permissionId: permission.id },
    });
    return { message: "Permission granted" };
  }

  static async revokePermission(userId: string, permissionName: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User not found");

    const permission = await prisma.permission.findUnique({
      where: { name: permissionName },
    });
    if (!permission) throw new NotFoundError("Permission not found");

    await prisma.userPermission.deleteMany({
      where: { userId, permissionId: permission.id },
    });
    return { message: "Permission revoked" };
  }
}
