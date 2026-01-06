// Permission types matching backend permission.types.ts
export enum Permission {
  // Patients
  PATIENTS_VIEW = "patients.view",
  PATIENTS_CREATE = "patients.create",
  PATIENTS_UPDATE = "patients.update",
  PATIENTS_DELETE = "patients.delete",

  // Treatments
  TREATMENTS_VIEW = "treatments.view",
  TREATMENTS_CREATE = "treatments.create",
  TREATMENTS_UPDATE = "treatments.update",
  TREATMENTS_DELETE = "treatments.delete",

  // Documents
  DOCUMENTS_VIEW = "documents.view",
  DOCUMENTS_CREATE = "documents.create",
  DOCUMENTS_UPDATE = "documents.update",
  DOCUMENTS_DELETE = "documents.delete",

  // Appointments
  APPOINTMENTS_VIEW = "appointments.view",
  APPOINTMENTS_CREATE = "appointments.create",
  APPOINTMENTS_UPDATE = "appointments.update",
  APPOINTMENTS_CANCEL = "appointments.cancel",

  // Payments
  PAYMENT_VIEW = "payment.view",
  PAYMENT_CREATE = "payment.create",
  PAYMENT_UPDATE = "payment.update",
  PAYMENT_DELETE = "payment.delete",
}
