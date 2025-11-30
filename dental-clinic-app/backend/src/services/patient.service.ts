import { NotFoundError } from "../errors/app.errors";
import prisma from "../config/prisma";


export class PatientService {
  static async createPatient(data: {
    firstName: string;
    lastName: string;
    dateOfBirth?: Date;
    phone?: string;
    email?: string;
    primaryDentistId?: string;
    registeredById?: string;
  }) {
    const patient = await prisma.patient.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth,
        phone: data.phone,
        email: data.email,
        primaryDentistId: data.primaryDentistId,
        registeredById: data.registeredById,
      },
      include: {
        primaryDentist: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return patient;
  }

  static async getAllPatients(filters?: { search?: string; primaryDentistId?: string }) {
    const where: any = {};

    if (filters?.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: "insensitive" } },
        { lastName: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { phone: { contains: filters.search } },
      ];
    }

    if (filters?.primaryDentistId) {
      where.primaryDentistId = filters.primaryDentistId;
    }

    const patients = await prisma.patient.findMany({
      where,
      include: {
        primaryDentist: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            appointments: true,
            treatments: true,
            payments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return patients;
  }

  static async getPatientById(id: string) {
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        primaryDentist: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            appointments: true,
            treatments: true,
            payments: true,
          },
        },
      },
    });

    if (!patient) {
      throw new NotFoundError("Patient not found");
    }

    return patient;
  }

  static async getPatientHistory(id: string) {
    const patient = await this.getPatientById(id);

    const [appointments, treatments, payments] = await Promise.all([
      prisma.appointment.findMany({
        where: { patientId: id },
        include: {
          doctor: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: { dateOfTreatment: "desc" },
      }),
      prisma.treatment.findMany({
        where: { patientId: id },
        include: {
          doctor: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: { dateOfTreatment: "desc" },
      }),
      prisma.payment.findMany({
        where: { patientId: id },
        orderBy: { date: "desc" },
      }),
    ]);

    return {
      patient,
      appointments,
      treatments,
      payments,
    };
  }

  static async updatePatient(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      dateOfBirth?: Date;
      phone?: string;
      email?: string;
      primaryDentistId?: string;
    }
  ) {
    await this.getPatientById(id);

    const patient = await prisma.patient.update({
      where: { id },
      data,
      include: {
        primaryDentist: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return patient;
  }

  static async deletePatient(id: string) {
    await this.getPatientById(id);

    await prisma.patient.delete({
      where: { id },
    });

    return { message: "Patient deleted successfully" };
  }
}
