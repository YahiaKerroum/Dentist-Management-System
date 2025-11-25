import { PrismaClient, Role, TreatmentType, PaymentMethod } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // Password hash for test accounts
    const password = await bcrypt.hash("password123", 10);

    // -----------------------
    // Manager User
    // -----------------------
    const managerUser = await prisma.user.upsert({
        where: { email: "manager@clinic.com" },
        update: {},
        create: {
            firstName: "Admin",
            lastName: "Manager",
            email: "manager@clinic.com",
            username: "manager",
            passwordHash: password,
            role: Role.MANAGER,
            managerProfile: {
                create: {}
            }
        },
        include: {
            managerProfile: true
        }
    });

    // -----------------------
    // Doctor User
    // -----------------------
    const doctorUser = await prisma.user.create({
        data: {
            firstName: "John",
            lastName: "Doe",
            email: "doctor@clinic.com",
            username: "doctor",
            passwordHash: password,
            role: Role.DOCTOR,
            doctorProfile: {
                create: {
                    specialization: "General Dentistry",
                    workingTime: JSON.stringify([
                        { day: "Monday", hours: "09:00-17:00" },
                        { day: "Tuesday", hours: "09:00-17:00" }
                    ])
                }
            }
        },
        include: {
            doctorProfile: true
        }
    });

    // -----------------------
    // Assistant User
    // -----------------------
    const assistantUser = await prisma.user.create({
        data: {
            firstName: "Sarah",
            lastName: "Assistant",
            email: "assistant@clinic.com",
            username: "assistant",
            passwordHash: password,
            role: Role.ASSISTANT,
            assistantProfile: {
                create: {}
            }
        },
        include: {
            assistantProfile: true
        }
    });

    // -----------------------
    // Test Patient
    // -----------------------
    await prisma.patient.create({
        data: {
            firstName: "Mark",
            lastName: "Smith",
            dateOfBirth: new Date("1990-04-22"),
            phone: "0555-123-456",
            email: "patient@clinic.com",
            primaryDentistId: doctorUser.doctorProfile?.id
        }
    });

    console.log("------------------------------------------------");
    console.log("👤 Manager ID:", managerUser.id);
    console.log("👤 Doctor ID:", doctorUser.id);
    console.log("👨‍⚕️ Doctor Profile ID:", doctorUser.doctorProfile?.id);
    console.log("👤 Assistant ID:", assistantUser.id);
    console.log("------------------------------------------------");

    // Generate a test token for the manager
    const token = jwt.sign(
        {
            userId: managerUser.id,
            username: managerUser.username,
            email: managerUser.email,
            role: managerUser.role
        },
        process.env.JWT_SECRET || "supersecretkey",
        { expiresIn: "30d" }
    );

    console.log("🔑 Test Token (Manager):");
    console.log(token);
    console.log("------------------------------------------------");
    console.log("🌱 Seeding completed!");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
