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
    // Doctor User (upsert to avoid duplicate-email errors)
    // -----------------------
    const doctorUser = await prisma.user.upsert({
        where: { email: "doctor@clinic.com" },
        update: {},
        create: {
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
    const assistantUser = await prisma.user.upsert({
        where: { email: "assistant@clinic.com" },
        update: {},
        create: {
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
    // Additional Doctors (create 2 more to make 3 total)
    // -----------------------
    const doctorUser2 = await prisma.user.upsert({
        where: { email: "doctor2@clinic.com" },
        update: {},
        create: {
            firstName: "Alice",
            lastName: "Brown",
            email: "doctor2@clinic.com",
            username: "doctor2",
            passwordHash: password,
            role: Role.DOCTOR,
            doctorProfile: {
                create: {
                    specialization: "Orthodontics",
                    workingTime: JSON.stringify([
                        { day: "Monday", hours: "10:00-18:00" },
                        { day: "Wednesday", hours: "09:00-15:00" }
                    ])
                }
            }
        },
        include: { doctorProfile: true }
    });

    const doctorUser3 = await prisma.user.upsert({
        where: { email: "doctor3@clinic.com" },
        update: {},
        create: {
            firstName: "Robert",
            lastName: "Green",
            email: "doctor3@clinic.com",
            username: "doctor3",
            passwordHash: password,
            role: Role.DOCTOR,
            doctorProfile: {
                create: {
                    specialization: "Pediatric Dentistry",
                    workingTime: JSON.stringify([
                        { day: "Tuesday", hours: "08:00-14:00" },
                        { day: "Thursday", hours: "12:00-18:00" }
                    ])
                }
            }
        },
        include: { doctorProfile: true }
    });

    // -----------------------
    // Create test patients (10 patients total)
    // -----------------------
    const doctorIds = [
        doctorUser.doctorProfile?.id,
        doctorUser2.doctorProfile?.id,
        doctorUser3.doctorProfile?.id
    ].filter(Boolean) as string[];

    const patientsData = [
        { firstName: "Mark", lastName: "Smith", dob: "1990-04-22", phone: "0555-123-456", email: "mark.smith@clinic.com" },
        { firstName: "Emma", lastName: "Johnson", dob: "1985-06-12", phone: "0555-222-333", email: "emma.johnson@clinic.com" },
        { firstName: "Liam", lastName: "Williams", dob: "2000-01-15", phone: "0555-333-444", email: "liam.williams@clinic.com" },
        { firstName: "Olivia", lastName: "Brown", dob: "1992-09-30", phone: "0555-444-555", email: "olivia.brown@clinic.com" },
        { firstName: "Noah", lastName: "Jones", dob: "1978-11-05", phone: "0555-555-666", email: "noah.jones@clinic.com" },
        { firstName: "Ava", lastName: "Garcia", dob: "1995-03-21", phone: "0555-666-777", email: "ava.garcia@clinic.com" },
        { firstName: "William", lastName: "Miller", dob: "1988-07-08", phone: "0555-777-888", email: "will.miller@clinic.com" },
        { firstName: "Sophia", lastName: "Davis", dob: "1999-12-02", phone: "0555-888-999", email: "sophia.davis@clinic.com" },
        { firstName: "James", lastName: "Rodriguez", dob: "1969-05-17", phone: "0555-999-000", email: "james.rodriguez@clinic.com" },
        { firstName: "Mia", lastName: "Martinez", dob: "2003-10-10", phone: "0555-000-111", email: "mia.martinez@clinic.com" }
    ];

    for (let i = 0; i < patientsData.length; i++) {
        const p = patientsData[i];
        const assignedDoctorId = doctorIds[i % doctorIds.length];
        // find by email (email is not necessarily a unique field in the schema)
        const existingPatient = await prisma.patient.findFirst({ where: { email: p.email } });

        if (existingPatient) {
            await prisma.patient.update({
                where: { id: existingPatient.id },
                data: {
                    firstName: p.firstName,
                    lastName: p.lastName,
                    dateOfBirth: new Date(p.dob),
                    phone: p.phone,
                    primaryDentistId: assignedDoctorId
                }
            });
        } else {
            await prisma.patient.create({
                data: {
                    firstName: p.firstName,
                    lastName: p.lastName,
                    dateOfBirth: new Date(p.dob),
                    phone: p.phone,
                    email: p.email,
                    primaryDentistId: assignedDoctorId
                }
            });
        }
    }

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
