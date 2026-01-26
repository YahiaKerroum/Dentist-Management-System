# Sprint 3 Documentation: Appointments, Treatments, Reports & Financial Management

**Project:** Dentist Management System  
**Sprint Duration:** Sprint 3  
**Sprint Goal:** Implement appointment scheduling, treatment management, financial tracking, and reporting features  
**Status:** Completed ✅

---

## Table of Contents
1. [Sprint Overview](#sprint-overview)
2. [Appointment Management](#appointment-management)
3. [Treatment Management](#treatment-management)
4. [Payment Processing](#payment-processing)
5. [Expense Tracking](#expense-tracking)
6. [Reporting System](#reporting-system)
7. [Document Management](#document-management)
8. [Data Visualization](#data-visualization)
9. [API Documentation](#api-documentation)

---

## Sprint Overview

### Objectives
- Implement comprehensive appointment scheduling system
- Create treatment tracking with detailed records
- Build payment processing and financial management
- Develop expense tracking for clinic operations
- Design reporting system for business insights
- Enable document upload and management
- Add data visualization for key metrics

### Key Achievements
- ✅ Full appointment CRUD with status management
- ✅ Treatment records with dental chart integration
- ✅ Payment processing with multiple methods
- ✅ Expense categorization and tracking
- ✅ Dynamic report generation
- ✅ Document upload/download functionality
- ✅ Interactive charts and analytics
- ✅ Financial dashboard with metrics

### Technical Stack Additions
- Chart.js / Recharts for data visualization
- File upload handling (multipart/form-data)
- PDF generation capabilities
- Date/time pickers for scheduling
- Status badge components

---

## Appointment Management

### Database Schema

**Appointment Model** (from `schema.prisma`)
```prisma
model Appointment {
  id                String          @id @default(uuid())
  patientId         String
  doctorProfileId   String
  dateOfTreatment   DateTime
  status            AppointmentStatus @default(SCHEDULED)
  notes             String?
  
  patient           Patient         @relation(fields: [patientId], references: [id])
  doctorProfile     DoctorProfile   @relation(fields: [doctorProfileId], references: [id])
  
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  @@map("appointments")
}

enum AppointmentStatus {
  SCHEDULED
  COMPLETED
  CANCELLED
  NO_SHOW
}
```

### Backend Implementation

**Appointment Service** (`appointment.service.ts`)

```typescript
export class AppointmentService {
  // Create new appointment
  static async createAppointment(data: {
    patientId: string;
    doctorProfileId: string;
    dateOfTreatment: Date;
    notes?: string;
  }) {
    // Check for scheduling conflicts
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorProfileId: data.doctorProfileId,
        dateOfTreatment: data.dateOfTreatment,
        status: {
          notIn: ['CANCELLED', 'COMPLETED'],
        },
      },
    });

    if (existingAppointment) {
      throw new BadRequestError('Time slot already booked');
    }

    return prisma.appointment.create({
      data: {
        patientId: data.patientId,
        doctorProfileId: data.doctorProfileId,
        dateOfTreatment: data.dateOfTreatment,
        notes: data.notes,
        status: 'SCHEDULED',
      },
      include: {
        patient: true,
        doctorProfile: {
          include: { user: true },
        },
      },
    });
  }

  // Get appointments with filters
  static async getAppointments(filters: {
    patientId?: string;
    doctorProfileId?: string;
    status?: AppointmentStatus;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const where: any = {};

    if (filters.patientId) {
      where.patientId = filters.patientId;
    }

    if (filters.doctorProfileId) {
      where.doctorProfileId = filters.doctorProfileId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.dateOfTreatment = {
        ...(filters.dateFrom && { gte: filters.dateFrom }),
        ...(filters.dateTo && { lte: filters.dateTo }),
      };
    }

    return prisma.appointment.findMany({
      where,
      include: {
        patient: true,
        doctorProfile: {
          include: { user: true },
        },
      },
      orderBy: { dateOfTreatment: 'asc' },
    });
  }

  // Update appointment status
  static async updateAppointmentStatus(
    id: string,
    status: AppointmentStatus
  ) {
    return prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        patient: true,
        doctorProfile: {
          include: { user: true },
        },
      },
    });
  }

  // Reschedule appointment
  static async rescheduleAppointment(
    id: string,
    newDateTime: Date
  ) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    // Check for conflicts
    const conflict = await prisma.appointment.findFirst({
      where: {
        doctorProfileId: appointment.doctorProfileId,
        dateOfTreatment: newDateTime,
        status: {
          notIn: ['CANCELLED', 'COMPLETED'],
        },
        id: { not: id },
      },
    });

    if (conflict) {
      throw new BadRequestError('Time slot already booked');
    }

    return prisma.appointment.update({
      where: { id },
      data: { dateOfTreatment: newDateTime },
      include: {
        patient: true,
        doctorProfile: {
          include: { user: true },
        },
      },
    });
  }
}
```

**Appointment Controller** (`appointment.controller.ts`)
```typescript
export class AppointmentController {
  static create = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;
    const appointment = await AppointmentService.createAppointment(data);
    sendSuccess(res, appointment, 201);
  });

  static getAll = asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      patientId: req.query.patientId as string,
      doctorProfileId: req.query.doctorProfileId as string,
      status: req.query.status as AppointmentStatus,
      dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
      dateTo: req.query.dateTo ? new Date(req.query.dateTo as string) : undefined,
    };
    
    const appointments = await AppointmentService.getAppointments(filters);
    sendSuccess(res, appointments);
  });

  static updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const appointment = await AppointmentService.updateAppointmentStatus(id, status);
    sendSuccess(res, appointment);
  });
}
```

### Frontend Implementation

**Appointment Calendar Component** (`AppointmentCalendar.tsx`)

```typescript
const AppointmentCalendar: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Fetch appointments for selected date
  const fetchAppointments = async () => {
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const response = await getAppointments({
      dateFrom: startOfDay,
      dateTo: endOfDay,
    });

    setAppointments(response.data);
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Calendar View */}
      <div className="col-span-8">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Appointments</h2>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus size={16} className="mr-2" />
              New Appointment
            </Button>
          </div>

          {/* Time slots grid */}
          <div className="space-y-2">
            {timeSlots.map((time) => {
              const appointmentAtTime = appointments.find(
                (a) => formatTime(a.dateOfTreatment) === time
              );

              return (
                <div key={time} className="flex items-center gap-4">
                  <div className="w-20 text-sm text-gray-600">{time}</div>
                  
                  {appointmentAtTime ? (
                    <div
                      className="flex-1 p-3 rounded-xl bg-[#3DBEA3]/10 border border-[#3DBEA3]/20 cursor-pointer hover:bg-[#3DBEA3]/20 transition-colors"
                      onClick={() => setSelectedAppointment(appointmentAtTime)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            {appointmentAtTime.patient.firstName} {appointmentAtTime.patient.lastName}
                          </div>
                          <div className="text-sm text-gray-600">
                            Dr. {appointmentAtTime.doctorProfile.user.lastName}
                          </div>
                        </div>
                        <StatusBadge status={appointmentAtTime.status} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 p-3 rounded-xl border border-dashed border-gray-200 text-sm text-gray-400">
                      Available
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Date picker sidebar */}
      <div className="col-span-4">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            inline
          />

          {/* Today's summary */}
          <div className="mt-6 space-y-3">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="text-sm text-gray-600">Total Appointments</div>
              <div className="text-2xl font-bold text-gray-900">{appointments.length}</div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-xl">
              <div className="text-sm text-green-600">Completed</div>
              <div className="text-2xl font-bold text-green-600">
                {appointments.filter(a => a.status === 'COMPLETED').length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

**Appointment Form Component** (`AppointmentForm.tsx`)

```typescript
const AppointmentForm: React.FC<AppointmentFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  mode = 'add',
}) => {
  const [formData, setFormData] = useState({
    patientId: initialData?.patientId || '',
    doctorProfileId: initialData?.doctorProfileId || '',
    dateOfTreatment: initialData?.dateOfTreatment || new Date(),
    notes: initialData?.notes || '',
  });

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);

  useEffect(() => {
    // Fetch patients and doctors
    fetchPatients();
    fetchDoctors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Patient Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <User size={16} className="inline mr-2" />
          Patient
        </label>
        <select
          value={formData.patientId}
          onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3DBEA3]/30 focus:border-[#3DBEA3]"
          required
        >
          <option value="">Select patient</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.firstName} {patient.lastName}
            </option>
          ))}
        </select>
      </div>

      {/* Doctor Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <Stethoscope size={16} className="inline mr-2" />
          Doctor
        </label>
        <select
          value={formData.doctorProfileId}
          onChange={(e) => setFormData({ ...formData, doctorProfileId: e.target.value })}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3DBEA3]/30 focus:border-[#3DBEA3]"
          required
        >
          <option value="">Select doctor</option>
          {doctors.map((doctor) => (
            <option key={doctor.id} value={doctor.id}>
              Dr. {doctor.user.firstName} {doctor.user.lastName} - {doctor.specialization}
            </option>
          ))}
        </select>
      </div>

      {/* Date & Time Picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <Calendar size={16} className="inline mr-2" />
          Date & Time
        </label>
        <DatePicker
          selected={formData.dateOfTreatment}
          onChange={(date) => setFormData({ ...formData, dateOfTreatment: date })}
          showTimeSelect
          dateFormat="MMMM d, yyyy h:mm aa"
          minDate={new Date()}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3DBEA3]/30 focus:border-[#3DBEA3]"
          required
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <FileText size={16} className="inline mr-2" />
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3DBEA3]/30 focus:border-[#3DBEA3] resize-none"
          rows={3}
          placeholder="Additional notes..."
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <Button type="submit" className="flex-1 bg-[#3DBEA3]">
          {mode === 'add' ? 'Schedule Appointment' : 'Update Appointment'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
};
```

**Status Badge Component:**
```typescript
const StatusBadge: React.FC<{ status: AppointmentStatus }> = ({ status }) => {
  const statusConfig = {
    SCHEDULED: { color: 'bg-blue-100 text-blue-700', label: 'Scheduled' },
    COMPLETED: { color: 'bg-green-100 text-green-700', label: 'Completed' },
    CANCELLED: { color: 'bg-red-100 text-red-700', label: 'Cancelled' },
    NO_SHOW: { color: 'bg-gray-100 text-gray-700', label: 'No Show' },
  };

  const config = statusConfig[status];

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};
```

---

## Treatment Management

### Database Schema

**Treatment Model** (from `schema.prisma`)
```prisma
model Treatment {
  id                String          @id @default(uuid())
  patientId         String
  doctorProfileId   String
  typeOfTreatment   String
  dateOfTreatment   DateTime
  cost              Decimal         @db.Decimal(10, 2)
  notes             String?
  teethInvolved     String[]        @default([])
  procedures        String[]        @default([])
  followUpRequired  Boolean         @default(false)
  followUpDate      DateTime?
  
  patient           Patient         @relation(fields: [patientId], references: [id])
  doctorProfile     DoctorProfile   @relation(fields: [doctorProfileId], references: [id])
  payment           Payment?
  
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  @@map("treatments")
}
```

### Backend Implementation

**Treatment Service** (`treatment.service.ts`)

```typescript
export class TreatmentService {
  // Create new treatment record
  static async createTreatment(data: {
    patientId: string;
    doctorProfileId: string;
    typeOfTreatment: string;
    dateOfTreatment: Date;
    cost: number;
    notes?: string;
    teethInvolved?: string[];
    procedures?: string[];
    followUpRequired?: boolean;
    followUpDate?: Date;
  }) {
    return prisma.treatment.create({
      data: {
        patientId: data.patientId,
        doctorProfileId: data.doctorProfileId,
        typeOfTreatment: data.typeOfTreatment,
        dateOfTreatment: data.dateOfTreatment,
        cost: data.cost,
        notes: data.notes,
        teethInvolved: data.teethInvolved || [],
        procedures: data.procedures || [],
        followUpRequired: data.followUpRequired || false,
        followUpDate: data.followUpDate,
      },
      include: {
        patient: true,
        doctorProfile: {
          include: { user: true },
        },
      },
    });
  }

  // Get treatments with filters
  static async getTreatments(filters: {
    patientId?: string;
    doctorProfileId?: string;
    typeOfTreatment?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const where: any = {};

    if (filters.patientId) {
      where.patientId = filters.patientId;
    }

    if (filters.doctorProfileId) {
      where.doctorProfileId = filters.doctorProfileId;
    }

    if (filters.typeOfTreatment) {
      where.typeOfTreatment = {
        contains: filters.typeOfTreatment,
        mode: 'insensitive',
      };
    }

    if (filters.dateFrom || filters.dateTo) {
      where.dateOfTreatment = {
        ...(filters.dateFrom && { gte: filters.dateFrom }),
        ...(filters.dateTo && { lte: filters.dateTo }),
      };
    }

    return prisma.treatment.findMany({
      where,
      include: {
        patient: true,
        doctorProfile: {
          include: { user: true },
        },
        payment: true,
      },
      orderBy: { dateOfTreatment: 'desc' },
    });
  }

  // Get treatment statistics for a patient
  static async getPatientTreatmentStats(patientId: string) {
    const treatments = await prisma.treatment.findMany({
      where: { patientId },
      include: { payment: true },
    });

    const totalCost = treatments.reduce((sum, t) => sum + Number(t.cost), 0);
    const totalPaid = treatments.reduce((sum, t) => 
      sum + (t.payment?.amountPaid ? Number(t.payment.amountPaid) : 0), 0
    );
    const outstandingBalance = totalCost - totalPaid;

    const treatmentTypes = treatments.reduce((acc, t) => {
      acc[t.typeOfTreatment] = (acc[t.typeOfTreatment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalTreatments: treatments.length,
      totalCost,
      totalPaid,
      outstandingBalance,
      treatmentTypes,
      followUpRequired: treatments.filter(t => t.followUpRequired).length,
    };
  }
}
```

### Frontend Implementation

**Treatment List Component** (`TreatmentList.tsx`)

```typescript
const TreatmentList: React.FC<{ patientId: string }> = ({ patientId }) => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTreatments();
  }, [patientId]);

  const fetchTreatments = async () => {
    const response = await getTreatments({ patientId });
    setTreatments(response.data);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Treatment History</h3>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={16} className="mr-2" />
          Add Treatment
        </Button>
      </div>

      {/* Treatment cards */}
      <div className="space-y-3">
        {treatments.map((treatment) => (
          <div
            key={treatment.id}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">{treatment.typeOfTreatment}</h4>
                <p className="text-sm text-gray-600">
                  Dr. {treatment.doctorProfile.user.firstName} {treatment.doctorProfile.user.lastName}
                </p>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">${treatment.cost}</div>
                <div className="text-sm text-gray-600">
                  {formatDate(treatment.dateOfTreatment)}
                </div>
              </div>
            </div>

            {/* Teeth involved */}
            {treatment.teethInvolved.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Activity size={14} />
                Teeth: {treatment.teethInvolved.join(', ')}
              </div>
            )}

            {/* Procedures */}
            {treatment.procedures.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {treatment.procedures.map((procedure, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs"
                  >
                    {procedure}
                  </span>
                ))}
              </div>
            )}

            {/* Follow-up indicator */}
            {treatment.followUpRequired && (
              <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                <AlertCircle size={14} />
                Follow-up required: {formatDate(treatment.followUpDate)}
              </div>
            )}

            {/* Payment status */}
            {treatment.payment ? (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className="font-medium text-green-600">
                    Paid ${treatment.payment.amountPaid}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <span className="text-sm text-red-600">⚠ Payment pending</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

**Treatment Form with Dental Chart:**
```typescript
const TreatmentForm: React.FC = () => {
  const [selectedTeeth, setSelectedTeeth] = useState<string[]>([]);
  
  // Dental chart with clickable teeth
  const dentalChart = [
    // Upper jaw
    ['18', '17', '16', '15', '14', '13', '12', '11', '21', '22', '23', '24', '25', '26', '27', '28'],
    // Lower jaw
    ['48', '47', '46', '45', '44', '43', '42', '41', '31', '32', '33', '34', '35', '36', '37', '38'],
  ];

  const toggleTooth = (tooth: string) => {
    if (selectedTeeth.includes(tooth)) {
      setSelectedTeeth(selectedTeeth.filter(t => t !== tooth));
    } else {
      setSelectedTeeth([...selectedTeeth, tooth]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dental Chart */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Teeth Involved
        </label>
        <div className="space-y-4">
          {dentalChart.map((row, idx) => (
            <div key={idx} className="flex justify-center gap-2">
              {row.map((tooth) => (
                <button
                  key={tooth}
                  type="button"
                  onClick={() => toggleTooth(tooth)}
                  className={`w-8 h-10 rounded-lg border-2 text-xs font-medium transition-all ${
                    selectedTeeth.includes(tooth)
                      ? 'bg-[#3DBEA3] border-[#3DBEA3] text-white'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-[#3DBEA3]'
                  }`}
                >
                  {tooth}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Treatment details form fields... */}
    </div>
  );
};
```

---

## Payment Processing

### Database Schema

**Payment Model** (from `schema.prisma`)
```prisma
model Payment {
  id            String        @id @default(uuid())
  treatmentId   String        @unique
  patientId     String
  amountPaid    Decimal       @db.Decimal(10, 2)
  paymentMethod PaymentMethod
  paymentDate   DateTime
  notes         String?
  
  treatment     Treatment     @relation(fields: [treatmentId], references: [id])
  patient       Patient       @relation(fields: [patientId], references: [id])
  
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@map("payments")
}

enum PaymentMethod {
  CASH
  CARD
  INSURANCE
  BANK_TRANSFER
}
```

### Backend Implementation

**Payment Service** (`payment.service.ts`)

```typescript
export class PaymentService {
  // Create payment record
  static async createPayment(data: {
    treatmentId: string;
    patientId: string;
    amountPaid: number;
    paymentMethod: PaymentMethod;
    paymentDate: Date;
    notes?: string;
  }) {
    // Verify treatment exists and hasn't been paid
    const treatment = await prisma.treatment.findUnique({
      where: { id: data.treatmentId },
      include: { payment: true },
    });

    if (!treatment) {
      throw new NotFoundError('Treatment not found');
    }

    if (treatment.payment) {
      throw new BadRequestError('Treatment already paid');
    }

    return prisma.payment.create({
      data: {
        treatmentId: data.treatmentId,
        patientId: data.patientId,
        amountPaid: data.amountPaid,
        paymentMethod: data.paymentMethod,
        paymentDate: data.paymentDate,
        notes: data.notes,
      },
      include: {
        treatment: true,
        patient: true,
      },
    });
  }

  // Get payment statistics
  static async getPaymentStats(filters: {
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const where: any = {};

    if (filters.dateFrom || filters.dateTo) {
      where.paymentDate = {
        ...(filters.dateFrom && { gte: filters.dateFrom }),
        ...(filters.dateTo && { lte: filters.dateTo }),
      };
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        treatment: true,
      },
    });

    const totalRevenue = payments.reduce(
      (sum, p) => sum + Number(p.amountPaid),
      0
    );

    const byMethod = payments.reduce((acc, p) => {
      acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + Number(p.amountPaid);
      return acc;
    }, {} as Record<PaymentMethod, number>);

    return {
      totalRevenue,
      totalPayments: payments.length,
      byMethod,
      averagePayment: totalRevenue / payments.length || 0,
    };
  }

  // Get patient payment history
  static async getPatientPayments(patientId: string) {
    return prisma.payment.findMany({
      where: { patientId },
      include: {
        treatment: {
          include: {
            doctorProfile: {
              include: { user: true },
            },
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    });
  }
}
```

### Frontend Implementation

**Payment Form Component:**
```typescript
const PaymentForm: React.FC = ({ treatmentId, onSuccess }) => {
  const [formData, setFormData] = useState({
    amountPaid: 0,
    paymentMethod: 'CASH' as PaymentMethod,
    paymentDate: new Date(),
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPayment({ ...formData, treatmentId });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Amount Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <DollarSign size={16} className="inline mr-2" />
          Amount Paid
        </label>
        <input
          type="number"
          step="0.01"
          value={formData.amountPaid}
          onChange={(e) => setFormData({ ...formData, amountPaid: parseFloat(e.target.value) })}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3DBEA3]/30"
          required
        />
      </div>

      {/* Payment Method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <CreditCard size={16} className="inline mr-2" />
          Payment Method
        </label>
        <select
          value={formData.paymentMethod}
          onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3DBEA3]/30"
        >
          <option value="CASH">Cash</option>
          <option value="CARD">Credit/Debit Card</option>
          <option value="INSURANCE">Insurance</option>
          <option value="BANK_TRANSFER">Bank Transfer</option>
        </select>
      </div>

      {/* Payment Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          <Calendar size={16} className="inline mr-2" />
          Payment Date
        </label>
        <DatePicker
          selected={formData.paymentDate}
          onChange={(date) => setFormData({ ...formData, paymentDate: date })}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3DBEA3]/30"
          maxDate={new Date()}
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3DBEA3]/30 resize-none"
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full bg-[#3DBEA3]">
        Record Payment
      </Button>
    </form>
  );
};
```

---

## Expense Tracking

### Database Schema

**Expense Model** (from `schema.prisma`)
```prisma
model Expense {
  id            String        @id @default(uuid())
  amount        Decimal       @db.Decimal(10, 2)
  category      String
  description   String
  expenseDate   DateTime
  paidBy        String?
  
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@map("expenses")
}
```

### Backend Implementation

**Expense Service:**
```typescript
export class ExpenseService {
  static async createExpense(data: {
    amount: number;
    category: string;
    description: string;
    expenseDate: Date;
    paidBy?: string;
  }) {
    return prisma.expense.create({ data });
  }

  static async getExpenses(filters: {
    category?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const where: any = {};

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.expenseDate = {
        ...(filters.dateFrom && { gte: filters.dateFrom }),
        ...(filters.dateTo && { lte: filters.dateTo }),
      };
    }

    return prisma.expense.findMany({
      where,
      orderBy: { expenseDate: 'desc' },
    });
  }

  static async getExpenseStats(filters: { dateFrom?: Date; dateTo?: Date }) {
    const expenses = await this.getExpenses(filters);

    const totalExpenses = expenses.reduce(
      (sum, e) => sum + Number(e.amount),
      0
    );

    const byCategory = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
      return acc;
    }, {} as Record<string, number>);

    return {
      totalExpenses,
      expenseCount: expenses.length,
      byCategory,
      averageExpense: totalExpenses / expenses.length || 0,
    };
  }
}
```

### Frontend Expense Management

**Expense List with Categorization:**
```typescript
const ExpenseList: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = [
    'ALL',
    'Supplies',
    'Equipment',
    'Utilities',
    'Salaries',
    'Rent',
    'Marketing',
    'Other',
  ];

  const filteredExpenses = selectedCategory === 'ALL'
    ? expenses
    : expenses.filter(e => e.category === selectedCategory);

  const totalExpenses = filteredExpenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  return (
    <div className="space-y-6">
      {/* Category filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === category
                ? 'bg-[#3DBEA3] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Total expenses card */}
      <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white">
        <div className="text-sm opacity-90 mb-1">Total Expenses ({selectedCategory})</div>
        <div className="text-3xl font-bold">${totalExpenses.toFixed(2)}</div>
      </div>

      {/* Expense list */}
      <div className="space-y-3">
        {filteredExpenses.map((expense) => (
          <div
            key={expense.id}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold text-gray-900">{expense.description}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">
                    {expense.category}
                  </span>
                  <span className="text-sm text-gray-600">
                    {formatDate(expense.expenseDate)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-red-600">${expense.amount}</div>
                {expense.paidBy && (
                  <div className="text-sm text-gray-600">by {expense.paidBy}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## Reporting System

### Financial Report Generation

**Report Service:**
```typescript
export class ReportService {
  // Generate financial summary report
  static async generateFinancialReport(dateFrom: Date, dateTo: Date) {
    // Get payment stats
    const paymentStats = await PaymentService.getPaymentStats({
      dateFrom,
      dateTo,
    });

    // Get expense stats
    const expenseStats = await ExpenseService.getExpenseStats({
      dateFrom,
      dateTo,
    });

    // Calculate profit
    const profit = paymentStats.totalRevenue - expenseStats.totalExpenses;
    const profitMargin = (profit / paymentStats.totalRevenue) * 100;

    return {
      period: {
        from: dateFrom,
        to: dateTo,
      },
      revenue: {
        total: paymentStats.totalRevenue,
        count: paymentStats.totalPayments,
        average: paymentStats.averagePayment,
        byMethod: paymentStats.byMethod,
      },
      expenses: {
        total: expenseStats.totalExpenses,
        count: expenseStats.expenseCount,
        average: expenseStats.averageExpense,
        byCategory: expenseStats.byCategory,
      },
      profit: {
        amount: profit,
        margin: profitMargin,
      },
    };
  }

  // Generate patient statistics report
  static async generatePatientReport() {
    const totalPatients = await prisma.patient.count();
    
    const patientsByDoctor = await prisma.doctorProfile.findMany({
      include: {
        _count: {
          select: { patients: true },
        },
        user: true,
      },
    });

    const recentPatients = await prisma.patient.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    });

    return {
      totalPatients,
      newPatientsThisMonth: recentPatients.length,
      patientsByDoctor: patientsByDoctor.map(d => ({
        doctorName: `Dr. ${d.user.firstName} ${d.user.lastName}`,
        patientCount: d._count.patients,
      })),
    };
  }

  // Generate appointment statistics report
  static async generateAppointmentReport(dateFrom: Date, dateTo: Date) {
    const appointments = await prisma.appointment.findMany({
      where: {
        dateOfTreatment: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
    });

    const byStatus = appointments.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {} as Record<AppointmentStatus, number>);

    const completionRate =
      ((byStatus.COMPLETED || 0) / appointments.length) * 100;
    const noShowRate = ((byStatus.NO_SHOW || 0) / appointments.length) * 100;

    return {
      totalAppointments: appointments.length,
      byStatus,
      completionRate,
      noShowRate,
    };
  }
}
```

### Frontend Reporting Dashboard

**Report Page Component:**
```typescript
const ReportsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    const response = await getFinancialReport(dateRange.from, dateRange.to);
    setReportData(response.data);
  };

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Financial Reports</h2>
          <div className="flex gap-3">
            <DatePicker
              selected={dateRange.from}
              onChange={(date) => setDateRange({ ...dateRange, from: date })}
              className="px-4 py-2 border border-gray-200 rounded-xl"
            />
            <span className="text-gray-500">to</span>
            <DatePicker
              selected={dateRange.to}
              onChange={(date) => setDateRange({ ...dateRange, to: date })}
              className="px-4 py-2 border border-gray-200 rounded-xl"
            />
          </div>
        </div>
      </div>

      {reportData && (
        <>
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
              <div className="text-sm opacity-90 mb-1">Total Revenue</div>
              <div className="text-3xl font-bold">${reportData.revenue.total}</div>
              <div className="text-sm opacity-90 mt-2">
                {reportData.revenue.count} payments
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white">
              <div className="text-sm opacity-90 mb-1">Total Expenses</div>
              <div className="text-3xl font-bold">${reportData.expenses.total}</div>
              <div className="text-sm opacity-90 mt-2">
                {reportData.expenses.count} transactions
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
              <div className="text-sm opacity-90 mb-1">Net Profit</div>
              <div className="text-3xl font-bold">${reportData.profit.amount}</div>
              <div className="text-sm opacity-90 mt-2">
                {reportData.profit.margin.toFixed(1)}% margin
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-6">
            {/* Revenue by Payment Method */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Revenue by Payment Method</h3>
              <PieChart data={reportData.revenue.byMethod} />
            </div>

            {/* Expenses by Category */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Expenses by Category</h3>
              <BarChart data={reportData.expenses.byCategory} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
```

---

## Document Management

### Database Schema

**Document Model:**
```prisma
model Document {
  id          String    @id @default(uuid())
  patientId   String
  fileName    String
  fileType    String
  fileUrl     String
  uploadedBy  String
  uploadDate  DateTime  @default(now())
  
  patient     Patient   @relation(fields: [patientId], references: [id])
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@map("documents")
}
```

### Document Upload Implementation

**Backend File Upload Middleware:**
```typescript
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|jpg|jpeg|png|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type'));
  },
});
```

**Document Upload Component:**
```typescript
const DocumentUpload: React.FC<{ patientId: string }> = ({ patientId }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?[0];
    if (!file) return;

    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('patientId', patientId);

    try {
      await uploadDocument(formData);
      // Refresh document list
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleUpload}
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
      />
      
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="bg-[#3DBEA3]"
      >
        {uploading ? (
          <>
            <Loader size={16} className="mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload size={16} className="mr-2" />
            Upload Document
          </>
        )}
      </Button>
    </div>
  );
};
```

---

## Data Visualization

### Chart Components

**Revenue Trend Chart:**
```typescript
import { Line } from 'react-chartjs-2';

const RevenueTrendChart: React.FC<{ data: any }> = ({ data }) => {
  const chartData = {
    labels: data.labels, // ['Jan', 'Feb', 'Mar', ...]
    datasets: [
      {
        label: 'Revenue',
        data: data.values,
        borderColor: '#3DBEA3',
        backgroundColor: 'rgba(61, 190, 163, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number) => `$${value}`,
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};
```

**Appointment Status Pie Chart:**
```typescript
import { Pie } from 'react-chartjs-2';

const AppointmentStatusChart: React.FC<{ data: any }> = ({ data }) => {
  const chartData = {
    labels: ['Scheduled', 'Completed', 'Cancelled', 'No Show'],
    datasets: [
      {
        data: [
          data.SCHEDULED,
          data.COMPLETED,
          data.CANCELLED,
          data.NO_SHOW,
        ],
        backgroundColor: [
          '#3B82F6', // Blue
          '#10B981', // Green
          '#EF4444', // Red
          '#6B7280', // Gray
        ],
      },
    ],
  };

  return <Pie data={chartData} />;
};
```

---

## API Endpoints Summary

### Appointment Endpoints
```
GET    /api/appointments
POST   /api/appointments
GET    /api/appointments/:id
PUT    /api/appointments/:id
DELETE /api/appointments/:id
PATCH  /api/appointments/:id/status
POST   /api/appointments/:id/reschedule
```

### Treatment Endpoints
```
GET    /api/treatments
POST   /api/treatments
GET    /api/treatments/:id
PUT    /api/treatments/:id
DELETE /api/treatments/:id
GET    /api/treatments/patient/:patientId/stats
```

### Payment Endpoints
```
GET    /api/payments
POST   /api/payments
GET    /api/payments/:id
GET    /api/payments/patient/:patientId
GET    /api/payments/stats
```

### Expense Endpoints
```
GET    /api/expenses
POST   /api/expenses
GET    /api/expenses/:id
PUT    /api/expenses/:id
DELETE /api/expenses/:id
GET    /api/expenses/stats
```

### Report Endpoints
```
GET    /api/reports/financial?from=DATE&to=DATE
GET    /api/reports/patients
GET    /api/reports/appointments?from=DATE&to=DATE
GET    /api/reports/doctors
```

### Document Endpoints
```
GET    /api/documents/patient/:patientId
POST   /api/documents/upload
DELETE /api/documents/:id
GET    /api/documents/:id/download
```

---

## Sprint Retrospective

### What Went Well
- ✅ Comprehensive appointment scheduling system
- ✅ Detailed treatment tracking with dental charts
- ✅ Robust payment and expense management
- ✅ Dynamic reporting with visualizations
- ✅ Clean and consistent UI throughout
- ✅ Good separation of business logic

### Challenges & Solutions
- **Challenge:** Handling appointment conflicts and double-bookings
  - **Solution:** Implemented conflict checking before creating appointments
  
- **Challenge:** File upload security and validation
  - **Solution:** Added multer with file type and size validation
  
- **Challenge:** Report generation performance with large datasets
  - **Solution:** Added date filtering and database indexing

### Technical Debt
- Need real-time appointment updates (WebSocket/SSE)
- Missing appointment reminders/notifications
- No bulk operations for treatments/payments
- Limited export formats for reports (need Excel/CSV)
- No audit logging for financial transactions

### Lessons Learned
- Always validate date ranges to prevent future booking errors
- File uploads need comprehensive security measures
- Charts should be lazy-loaded for performance
- Financial calculations require decimal precision
- User feedback during async operations is crucial

### Future Enhancements
- Email/SMS appointment reminders
- Online payment integration
- Treatment plan templates
- Automated report scheduling
- Mobile application
- Patient portal for self-service

---

**Document Version:** 1.0  
**Last Updated:** January 26, 2026  
**Prepared By:** Development Team  
**Status:** Sprint Completed ✅
