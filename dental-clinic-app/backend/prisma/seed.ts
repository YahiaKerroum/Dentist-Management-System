import { PrismaClient, Role, TreatmentType, PaymentMethod, AppointmentStatus, TreatmentStatus, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { seedPermissions } from "./seeders/permissions.seed";

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

const TREATMENT_BASE_COST: Record<string, number> = {
    CONSULTATION: 50,
    FILLING: 180,
    EXTRACTION: 220,
    ROOT_CANAL: 650,
    CLEANING: 120,
    IMPLANT: 1800,
    ORTHODONTICS: 2500,
    OTHER: 150,
};

function costFor(type: string): number {
    const base = TREATMENT_BASE_COST[type] ?? 150;
    const variance = base * 0.2;
    return Math.round(base + (Math.random() * variance * 2 - variance));
}

async function main() {
    console.log("🌱 Seeding database with comprehensive data...");

    // Seed permissions first
    await seedPermissions();

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
    // Rooms (Chairs / X-Ray / Surgery)
    // -----------------------
    const roomsData = [
        { name: "Chair 1", type: "CHAIR" as const, order: 0 },
        { name: "Chair 2", type: "CHAIR" as const, order: 1 },
        { name: "Chair 3", type: "CHAIR" as const, order: 2 },
        { name: "X-Ray Room", type: "XRAY" as const, order: 3 },
        { name: "Surgery Room", type: "SURGERY" as const, order: 4 }
    ];

    const rooms = [];
    for (const r of roomsData) {
        const room = await prisma.room.upsert({
            where: { name: r.name },
            update: { type: r.type, order: r.order },
            create: r
        });
        rooms.push(room);
    }
    console.log(`✅ Seeded ${rooms.length} rooms`);

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

    const paymentMethods: PaymentMethod[] = [PaymentMethod.CASH, PaymentMethod.CARD, PaymentMethod.INSURANCE, PaymentMethod.TRANSFER];

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

        const followUpDate = appointment.followUpRequired
            ? new Date(appointment.dateOfTreatment.getTime() + (3 + Math.floor(Math.random() * 11)) * 24 * 60 * 60 * 1000)
            : null;

        await prisma.treatment.create({
            data: {
                doctorId: appointment.doctorId,
                patientId: appointment.patientId,
                appointmentId: appointment.id,
                dateOfTreatment: appointment.dateOfTreatment,
                typeOfTreatment: treatmentType,
                notes: `Treatment completed: ${procedure}. Outcome: successful. Follow-up: ${appointment.followUpRequired ? "yes" : "no"}`,
                procedure: procedure,
                teeth: { create: appointment.teethInvolved.map((toothNumber) => ({ toothNumber })) },
                followUpRequired: appointment.followUpRequired,
                followUpDate,
                status: appointment.status === AppointmentStatus.COMPLETED ? TreatmentStatus.COMPLETED : TreatmentStatus.PLANNED,
                cost: new Prisma.Decimal(costFor(treatmentType))
            }
        });
        treatmentCount++;
    }
    console.log(`✅ Created ${treatmentCount} treatments`);

    // -----------------------
    // Today's Clinic Activity (for Clinic Pulse dashboard)
    // -----------------------
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setHours(23, 59, 59, 999);
    const now = new Date();

    // Re-running the seed shouldn't pile up duplicate "today" demo appointments
    const staleToday = await prisma.appointment.findMany({
        where: { dateOfTreatment: { gte: todayStart, lte: todayEnd } },
        select: { id: true }
    });
    const staleTodayIds = staleToday.map(a => a.id);
    if (staleTodayIds.length) {
        await prisma.treatment.deleteMany({ where: { appointmentId: { in: staleTodayIds } } });
        await prisma.appointment.deleteMany({ where: { id: { in: staleTodayIds } } });
    }

    function atToday(hour: number, minute: number = 0): Date {
        const d = new Date(todayStart);
        d.setHours(hour, minute, 0, 0);
        return d;
    }

    const chairRooms = rooms.filter(r => r.type === "CHAIR");
    const xrayRoom = rooms.find(r => r.type === "XRAY")!;
    const surgeryRoom = rooms.find(r => r.type === "SURGERY")!;
    const currentHour = Math.min(Math.max(now.getHours() + now.getMinutes() / 60, 9), 17);

    interface TodaySlot {
        time: Date;
        status: AppointmentStatus;
        room: typeof rooms[number];
        duration: number;
    }

    const slots: TodaySlot[] = [];

    // Earlier today: already completed visits
    [9, 9.5, 10, 10.5, 11].forEach((h, idx) => {
        if (h < currentHour - 0.5) {
            slots.push({ time: atToday(Math.floor(h), (h % 1) * 60), status: AppointmentStatus.COMPLETED, room: chairRooms[idx % chairRooms.length], duration: 30 });
        }
    });

    // Happening right now
    slots.push({ time: atToday(Math.floor(currentHour), Math.round((currentHour % 1) * 60)), status: AppointmentStatus.IN_PROGRESS, room: chairRooms[0], duration: 30 });

    // Checked in and waiting
    slots.push({ time: atToday(Math.floor(currentHour), Math.min(59, Math.round((currentHour % 1) * 60) + 10)), status: AppointmentStatus.CHECKED_IN, room: chairRooms[1], duration: 30 });
    slots.push({ time: atToday(Math.floor(currentHour), Math.min(59, Math.round((currentHour % 1) * 60) + 20)), status: AppointmentStatus.CHECKED_IN, room: chairRooms[2], duration: 45 });

    // A delayed/no-show visit earlier this morning for realism
    slots.push({ time: atToday(Math.max(8, Math.floor(currentHour) - 1), 15), status: AppointmentStatus.NO_SHOW, room: xrayRoom, duration: 20 });

    // Rest of today: scheduled ahead
    [currentHour + 1, currentHour + 1.5, currentHour + 2.5, currentHour + 3, currentHour + 4].forEach((h, idx) => {
        if (h <= 18) {
            slots.push({ time: atToday(Math.floor(h), Math.round((h % 1) * 60)), status: AppointmentStatus.SCHEDULED, room: idx % 4 === 0 ? surgeryRoom : chairRooms[idx % chairRooms.length], duration: 30 });
        }
    });

    let todayApptCount = 0;
    let todayRevenue = 0;
    for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        const patient = patients[(i * 3 + 7) % patients.length];
        const doctor = doctorUsers[i % doctorUsers.length];
        const treatmentType = getRandomItem(treatmentTypes);
        const followUp = Math.random() > 0.5;

        const appt = await prisma.appointment.create({
            data: {
                doctorId: doctor.doctorProfile!.id,
                patientId: patient.id,
                dateOfTreatment: slot.time,
                durationMinutes: slot.duration,
                status: slot.status,
                typeOfTreatment: treatmentType,
                notes: `Clinic Pulse demo visit (${slot.status}).`,
                procedure: getRandomItem(procedures),
                teethInvolved: [Math.floor(Math.random() * 32) + 1],
                followUpRequired: followUp,
                roomId: slot.room.id,
                createdByUserId: managerUser.id
            }
        });
        todayApptCount++;

        if (slot.status === AppointmentStatus.COMPLETED || slot.status === AppointmentStatus.IN_PROGRESS) {
            const cost = costFor(treatmentType);
            await prisma.treatment.create({
                data: {
                    doctorId: doctor.doctorProfile!.id,
                    patientId: patient.id,
                    appointmentId: appt.id,
                    dateOfTreatment: slot.time,
                    typeOfTreatment: treatmentType,
                    notes: `${treatmentType} performed during today's visit.`,
                    procedure: appt.procedure,
                    teeth: { create: appt.teethInvolved.map((toothNumber) => ({ toothNumber })) },
                    followUpRequired: followUp,
                    followUpDate: followUp ? new Date(todayStart.getTime() + (2 + Math.floor(Math.random() * 5)) * 24 * 60 * 60 * 1000) : null,
                    status: slot.status === AppointmentStatus.COMPLETED ? TreatmentStatus.COMPLETED : TreatmentStatus.PLANNED,
                    cost: new Prisma.Decimal(cost)
                }
            });

            if (slot.status === AppointmentStatus.COMPLETED) {
                const paidInFull = Math.random() > 0.35;
                const paidAmount = paidInFull ? cost : Math.round(cost * (0.3 + Math.random() * 0.4));
                await prisma.payment.create({
                    data: {
                        patientId: patient.id,
                        recordedById: getRandomItem([managerUser, ...receptionistUsers]).id,
                        date: slot.time,
                        amount: new Prisma.Decimal(paidAmount),
                        method: getRandomItem(paymentMethods),
                        notes: `Payment for ${treatmentType} - ${paidInFull ? "paid in full" : "partial payment"}.`
                    }
                });
                todayRevenue += paidAmount;
            }
        }
    }
    console.log(`✅ Created ${todayApptCount} of today's appointments across ${rooms.length} rooms ($${todayRevenue} collected so far today)`);

    // A handful of overdue follow-ups so the "needs attention" widgets have real data
    const followUpCandidates = await prisma.treatment.findMany({
        where: { followUpRequired: true, followUpDate: null },
        take: 6
    });
    for (const t of followUpCandidates) {
        const daysAgo = Math.floor(Math.random() * 10) + 1;
        await prisma.treatment.update({
            where: { id: t.id },
            data: { followUpDate: new Date(todayStart.getTime() - daysAgo * 24 * 60 * 60 * 1000) }
        });
    }
    console.log(`✅ Marked ${followUpCandidates.length} treatments as overdue follow-ups`);

    // -----------------------
    // Create 40+ Payments
    // -----------------------
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
    // Create Documents for Patients
    // -----------------------
    const documentTypes = ["X-RAY", "PRESCRIPTION", "REPORT", "INVOICE", "OTHER"];
    const documentNames = [
        "Panoramic X-Ray",
        "Follow-up Prescription",
        "Treatment Summary",
        "Insurance Invoice",
        "Lab Report"
    ];

    let documentCount = 0;
    const uploaderId = doctorUsers[0]?.id || managerUser.id;

    for (const patient of patients.slice(0, 10)) { // seed docs for first 10 patients
        const numDocs = Math.floor(Math.random() * 2) + 1; // 1-2 docs per patient
        for (let i = 0; i < numDocs; i++) {
            const name = getRandomItem(documentNames);
            const type = getRandomItem(documentTypes);
            await prisma.document.create({
                data: {
                    patientId: patient.id,
                    uploadedById: uploaderId,
                    name,
                    type,
                    filePath: `/uploads/documents/${patient.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${name.replace(/\s+/g, '-')}.pdf`
                }
            });
            documentCount++;
        }
    }
    console.log(`✅ Created ${documentCount} documents`);

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
    console.log(`✅ ${documentCount} Documents uploaded`);
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
