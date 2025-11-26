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
    await this.getUserById(id);

    await prisma.user.delete({
      where: { id },
    });

    return { message: "User deleted successfully" };
  }
}
