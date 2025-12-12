import { PrismaClient, Role, TreatmentType, PaymentMethod, AppointmentStatus, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// Helper function to generate random date within last 90 days
function getRandomPastDate(daysBack: number = 90): Date {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
    date.setHours(Math.floor(Math.random() * 17) + 8, Math.random() * 60, 0);
    return date;
}

// Helper to get random item from array
function getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

async function main() {
    console.log("🌱 Seeding database with comprehensive data...");

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
    // Create 5 Doctors with different specializations
    // -----------------------
    const doctorUsers = [];
    const doctorData = [
        { firstName: "John", lastName: "Doe", email: "doctor@clinic.com", username: "doctor", specialization: "General Dentistry" },
        { firstName: "Alice", lastName: "Brown", email: "doctor2@clinic.com", username: "doctor2", specialization: "Orthodontics" },
        { firstName: "Robert", lastName: "Green", email: "doctor3@clinic.com", username: "doctor3", specialization: "Pediatric Dentistry" },
        { firstName: "Emily", lastName: "Wilson", email: "doctor4@clinic.com", username: "doctor4", specialization: "Periodontics" },
        { firstName: "Michael", lastName: "Chen", email: "doctor5@clinic.com", username: "doctor5", specialization: "Prosthodontics" }
    ];

    for (const doc of doctorData) {
        const doctor = await prisma.user.upsert({
            where: { email: doc.email },
            update: {},
            create: {
                firstName: doc.firstName,
                lastName: doc.lastName,
                email: doc.email,
                username: doc.username,
                passwordHash: password,
                role: Role.DOCTOR,
                doctorProfile: {
                    create: {
                        specialization: doc.specialization,
                        workingTime: JSON.stringify([
                            { day: "Monday", hours: "09:00-17:00" },
                            { day: "Tuesday", hours: "09:00-17:00" },
                            { day: "Wednesday", hours: "10:00-18:00" },
                            { day: "Thursday", hours: "09:00-17:00" },
                            { day: "Friday", hours: "09:00-15:00" }
                        ])
                    }
                }
            },
            include: { doctorProfile: true }
        });
        doctorUsers.push(doctor);
    }

    // -----------------------
    // Create 4 Assistants
    // -----------------------
    const assistantUsers = [];
    const assistantData = [
        { firstName: "Sarah", lastName: "Johnson", email: "assistant@clinic.com", username: "assistant" },
        { firstName: "Jessica", lastName: "Martinez", email: "assistant2@clinic.com", username: "assistant2" },
        { firstName: "Laura", lastName: "Garcia", email: "assistant3@clinic.com", username: "assistant3" },
        { firstName: "Amanda", lastName: "Davis", email: "assistant4@clinic.com", username: "assistant4" }
    ];

    for (const asst of assistantData) {
        const assistant = await prisma.user.upsert({
            where: { email: asst.email },
            update: {},
            create: {
                firstName: asst.firstName,
                lastName: asst.lastName,
                email: asst.email,
                username: asst.username,
                passwordHash: password,
                role: Role.ASSISTANT,
                assistantProfile: {
                    create: {}
                }
            },
            include: { assistantProfile: true }
        });
        assistantUsers.push(assistant);
    }

    // -----------------------
    // Create 2 Receptionists
    // -----------------------
    const receptionistUsers = [];
    const receptionistData = [
        { firstName: "Lisa", lastName: "Thompson", email: "receptionist@clinic.com", username: "receptionist" },
        { firstName: "Rachel", lastName: "Anderson", email: "receptionist2@clinic.com", username: "receptionist2" }
    ];

    for (const rec of receptionistData) {
        const receptionist = await prisma.user.upsert({
            where: { email: rec.email },
            update: {},
            create: {
                firstName: rec.firstName,
                lastName: rec.lastName,
                email: rec.email,
                username: rec.username,
                passwordHash: password,
                role: Role.RECEPTIONIST
            }
        });
        receptionistUsers.push(receptionist);
    }

    // -----------------------
    // Create 20 Patients
    // -----------------------
    const doctorIds = doctorUsers.map(d => d.doctorProfile?.id).filter(Boolean) as string[];

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
        { firstName: "Mia", lastName: "Martinez", dob: "2003-10-10", phone: "0555-000-111", email: "mia.martinez@clinic.com" },
        { firstName: "Lucas", lastName: "Taylor", dob: "1987-02-14", phone: "0555-111-222", email: "lucas.taylor@clinic.com" },
        { firstName: "Isabella", lastName: "Anderson", dob: "1991-08-25", phone: "0555-222-444", email: "isabella.anderson@clinic.com" },
        { firstName: "Benjamin", lastName: "Thomas", dob: "1980-11-30", phone: "0555-333-555", email: "benjamin.thomas@clinic.com" },
        { firstName: "Charlotte", lastName: "Jackson", dob: "1994-03-18", phone: "0555-444-666", email: "charlotte.jackson@clinic.com" },
        { firstName: "Henry", lastName: "White", dob: "1986-07-09", phone: "0555-555-777", email: "henry.white@clinic.com" },
        { firstName: "Amelia", lastName: "Harris", dob: "1998-05-20", phone: "0555-666-888", email: "amelia.harris@clinic.com" },
        { firstName: "Alexander", lastName: "Martin", dob: "1981-09-11", phone: "0555-777-999", email: "alexander.martin@clinic.com" },
        { firstName: "Harper", lastName: "Thompson", dob: "1996-01-07", phone: "0555-888-000", email: "harper.thompson@clinic.com" },
        { firstName: "Michael", lastName: "Garcia", dob: "1989-12-03", phone: "0555-000-222", email: "michael.garcia@clinic.com" },
        { firstName: "Evelyn", lastName: "Martinez", dob: "1993-04-16", phone: "0555-111-333", email: "evelyn.martinez@clinic.com" }
    ];

    const patients: any[] = [];
    for (let i = 0; i < patientsData.length; i++) {
        const p = patientsData[i];
        const assignedDoctorId = doctorIds[i % doctorIds.length];
        const existingPatient = await prisma.patient.findFirst({ where: { email: p.email } });

        let patient;
        if (existingPatient) {
            patient = await prisma.patient.update({
                where: { id: existingPatient.id },
                data: {
                    firstName: p.firstName,
                    lastName: p.lastName,
                    dateOfBirth: new Date(p.dob),
                    phone: p.phone,
                    primaryDentistId: assignedDoctorId,
                    registeredById: managerUser.id
                }
            });
        } else {
            patient = await prisma.patient.create({
                data: {
                    firstName: p.firstName,
                    lastName: p.lastName,
                    dateOfBirth: new Date(p.dob),
                    phone: p.phone,
                    email: p.email,
                    primaryDentistId: assignedDoctorId,
                    registeredById: managerUser.id
                }
            });
        }
        patients.push(patient);
    }

    console.log(`✅ Created/Updated ${patients.length} patients`);

    // -----------------------
    // Create 30+ Appointments
    // -----------------------
    const appointmentStatuses: AppointmentStatus[] = [
        AppointmentStatus.SCHEDULED,
        AppointmentStatus.COMPLETED,
        AppointmentStatus.CANCELLED,
        AppointmentStatus.NO_SHOW
    ];

    const treatmentTypes: TreatmentType[] = [
        TreatmentType.CONSULTATION,
        TreatmentType.FILLING,
        TreatmentType.EXTRACTION,
        TreatmentType.ROOT_CANAL,
        TreatmentType.CLEANING,
        TreatmentType.IMPLANT,
        TreatmentType.ORTHODONTICS
    ];

    const procedures = [
        "Upper right molar filling",
        "Lower left premolar cleaning",
        "Root canal treatment - upper left",
        "Tooth extraction - lower right",
        "Orthodontics consultation",
        "Implant placement planning",
        "Professional cleaning and whitening",
        "Emergency tooth repair",
        "Cavity assessment",
        "Bite adjustment"
    ];

    let appointmentCount = 0;
    for (let i = 0; i < patients.length; i++) {
        const patient = patients[i];
        const numAppointments = Math.floor(Math.random() * 4) + 1; // 1-4 appointments per patient

        for (let j = 0; j < numAppointments; j++) {
            const assignedDoctor = getRandomItem(doctorUsers);
            const status = getRandomItem(appointmentStatuses);
            const treatmentType = getRandomItem(treatmentTypes);
            const procedure = getRandomItem(procedures);
            const teethInvolved = [Math.floor(Math.random() * 32) + 1]; // Random tooth number

            await prisma.appointment.create({
                data: {
                    doctorId: assignedDoctor.doctorProfile!.id,
                    patientId: patient.id,
                    dateOfTreatment: getRandomPastDate(90),
                    status: status,
                    typeOfTreatment: treatmentType,
                    notes: `Appointment notes for ${procedure}. Patient history reviewed.`,
                    procedure: procedure,
                    teethInvolved: teethInvolved,
                    followUpRequired: Math.random() > 0.6,
                    createdByUserId: managerUser.id
                }
            });
            appointmentCount++;
        }
    }
    console.log(`✅ Created ${appointmentCount} appointments`);

    // -----------------------
    // Create Treatments (linked to some appointments)
    // -----------------------
    const appointments = await prisma.appointment.findMany();
    let treatmentCount = 0;
    
    for (let i = 0; i < Math.min(appointments.length, 25); i++) {
        const appointment = appointments[i];
        const treatmentType = getRandomItem(treatmentTypes);
        const procedure = getRandomItem(procedures);

        await prisma.treatment.create({
            data: {
                doctorId: appointment.doctorId,
                patientId: appointment.patientId,
                appointmentId: appointment.id,
                dateOfTreatment: appointment.dateOfTreatment,
                typeOfTreatment: treatmentType,
                notes: `Treatment completed: ${procedure}. Outcome: successful. Follow-up: ${appointment.followUpRequired ? "yes" : "no"}`,
                procedure: procedure,
                teethInvolved: appointment.teethInvolved,
                followUpRequired: appointment.followUpRequired,
                completed: appointment.status === AppointmentStatus.COMPLETED
            }
        });
        treatmentCount++;
    }
    console.log(`✅ Created ${treatmentCount} treatments`);

    // -----------------------
    // Create 40+ Payments
    // -----------------------
    const paymentMethods: PaymentMethod[] = [PaymentMethod.CASH, PaymentMethod.CARD, PaymentMethod.INSURANCE, PaymentMethod.TRANSFER];
    const paymentNames = [
        "Consultation Fee",
        "Filling Treatment",
        "Extraction Service",
        "Cleaning & Scaling",
        "Root Canal Treatment",
        "Implant Procedure",
        "Orthodontics Session",
        "Emergency Treatment",
        "Whitening Service",
        "X-ray & Diagnostics"
    ];

    let paymentCount = 0;
    for (const patient of patients) {
        const numPayments = Math.floor(Math.random() * 3) + 1; // 1-3 payments per patient

        for (let i = 0; i < numPayments; i++) {
            const amount = Math.floor(Math.random() * 800) + 50; // $50-$850
            const method = getRandomItem(paymentMethods);
            const paymentName = getRandomItem(paymentNames);

            await prisma.payment.create({
                data: {
                    patientId: patient.id,
                    recordedById: getRandomItem([managerUser, ...receptionistUsers]).id,
                    date: getRandomPastDate(90),
                    amount: new Prisma.Decimal(amount),
                    method: method,
                    notes: `Payment received for ${paymentName}. Reference: ${Math.random().toString(36).substring(7).toUpperCase()}`
                }
            });
            paymentCount++;
        }
    }
    console.log(`✅ Created ${paymentCount} payments`);

    // -----------------------
    // Create 25+ Expenses
    // -----------------------
    const expenseCategories = [
        "Supplies",
        "Equipment",
        "Maintenance",
        "Utilities",
        "Staff Salaries",
        "Office Rent",
        "Insurance",
        "Cleaning",
        "Marketing",
        "Consulting"
    ];

    const vendorNames = [
        "Dental Supplies Co",
        "Equipment Service Inc",
        "City Water Company",
        "Electric Utility",
        "Office Cleaning Services",
        "Marketing Agency",
        "IT Consulting",
        "Building Maintenance",
        "Medical Insurance",
        "Office Furniture Store",
        "Software License Provider",
        "Training & Development",
        "Lab Services",
        "Sterilization Equipment"
    ];

    let expenseCount = 0;
    for (let i = 0; i < 25; i++) {
        const amount = Math.floor(Math.random() * 5000) + 100; // $100-$5100
        const category = getRandomItem(expenseCategories);
        const paidTo = getRandomItem(vendorNames);
        const approved = Math.random() > 0.4; // 60% approved, 40% pending

        await prisma.expense.create({
            data: {
                category: category,
                paidTo: paidTo,
                amount: new Prisma.Decimal(amount),
                date: getRandomPastDate(90),
                recordedById: getRandomItem([managerUser, ...assistantUsers]).id,
                approved: approved,
                approvedById: approved ? managerUser.id : null,
                notes: `${category} expense for ${paidTo}. Amount: $${amount}. Status: ${approved ? "Approved" : "Pending approval"}`
            }
        });
        expenseCount++;
    }
    console.log(`✅ Created ${expenseCount} expenses`);

    console.log("\n================================================");
    console.log("🌱 DATABASE SEEDING SUMMARY");
    console.log("================================================");
    console.log(`✅ Users Created:`);
    console.log(`   - 1 Manager: ${managerUser.firstName} ${managerUser.lastName} (${managerUser.email})`);
    console.log(`   - ${doctorUsers.length} Doctors`);
    doctorUsers.forEach((doc, idx) => {
        console.log(`     ${idx + 1}. ${doc.firstName} ${doc.lastName} - ${doc.doctorProfile?.specialization}`);
    });
    console.log(`   - ${assistantUsers.length} Assistants`);
    console.log(`   - ${receptionistUsers.length} Receptionists`);
    console.log(`✅ ${patients.length} Patients created`);
    console.log(`✅ ${appointmentCount} Appointments scheduled`);
    console.log(`✅ ${treatmentCount} Treatments recorded`);
    console.log(`✅ ${paymentCount} Payments processed`);
    console.log(`✅ ${expenseCount} Expenses recorded`);
    console.log("================================================\n");

    // Generate test tokens
    const managerToken = jwt.sign(
        {
            userId: managerUser.id,
            username: managerUser.username,
            email: managerUser.email,
            role: managerUser.role
        },
        process.env.JWT_SECRET || "supersecretkey",
        { expiresIn: "30d" }
    );

    const doctorToken = jwt.sign(
        {
            userId: doctorUsers[0].id,
            username: doctorUsers[0].username,
            email: doctorUsers[0].email,
            role: doctorUsers[0].role
        },
        process.env.JWT_SECRET || "supersecretkey",
        { expiresIn: "30d" }
    );

    console.log("🔑 TEST CREDENTIALS");
    console.log("================================================");
    console.log("Manager Account:");
    console.log(`  Email: ${managerUser.email}`);
    console.log(`  Username: ${managerUser.username}`);
    console.log(`  Password: password123`);
    console.log(`  Token: ${managerToken}\n`);
    
    console.log("Doctor Account (Sample):");
    console.log(`  Email: ${doctorUsers[0].email}`);
    console.log(`  Username: ${doctorUsers[0].username}`);
    console.log(`  Password: password123`);
    console.log(`  Token: ${doctorToken}\n`);
    
    console.log("Assistant Account (Sample):");
    console.log(`  Email: ${assistantUsers[0].email}`);
    console.log(`  Username: ${assistantUsers[0].username}`);
    console.log(`  Password: password123\n`);

    console.log("Receptionist Account (Sample):");
    console.log(`  Email: ${receptionistUsers[0].email}`);
    console.log(`  Username: ${receptionistUsers[0].username}`);
    console.log(`  Password: password123\n`);
    
    console.log("================================================");
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
