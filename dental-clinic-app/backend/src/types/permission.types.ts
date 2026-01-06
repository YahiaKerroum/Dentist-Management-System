// Global permission names
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

  // Expenses
  EXPENSES_VIEW = "expenses.view",
  EXPENSES_CREATE = "expenses.create",
  EXPENSES_UPDATE = "expenses.update",
  EXPENSES_DELETE = "expenses.delete",
  EXPENSES_APPROVE = "expenses.approve",
}

export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  [Permission.PATIENTS_VIEW]: "View patient records",
  [Permission.PATIENTS_CREATE]: "Create new patient records",
  [Permission.PATIENTS_UPDATE]: "Update patient information",
  [Permission.PATIENTS_DELETE]: "Delete patient records",

  [Permission.TREATMENTS_VIEW]: "View treatment records",
  [Permission.TREATMENTS_CREATE]: "Create new treatment records",
  [Permission.TREATMENTS_UPDATE]: "Update treatment information",
  [Permission.TREATMENTS_DELETE]: "Delete treatment records",

  [Permission.DOCUMENTS_VIEW]: "View patient documents",
  [Permission.DOCUMENTS_CREATE]: "Upload patient documents",
  [Permission.DOCUMENTS_UPDATE]: "Update patient documents",
  [Permission.DOCUMENTS_DELETE]: "Delete patient documents",

  [Permission.APPOINTMENTS_VIEW]: "View appointments",
  [Permission.APPOINTMENTS_CREATE]: "Create appointments",
  [Permission.APPOINTMENTS_UPDATE]: "Update appointments",
  [Permission.APPOINTMENTS_CANCEL]: "Cancel appointments",

  [Permission.PAYMENT_VIEW]: "View payment records",
  [Permission.PAYMENT_CREATE]: "Create payment records",
  [Permission.PAYMENT_UPDATE]: "Update payment records",
  [Permission.PAYMENT_DELETE]: "Delete payment records",

  [Permission.EXPENSES_VIEW]: "View expense records",
  [Permission.EXPENSES_CREATE]: "Create expense records",
  [Permission.EXPENSES_UPDATE]: "Update expense records",
  [Permission.EXPENSES_DELETE]: "Delete expense records",
  [Permission.EXPENSES_APPROVE]: "Approve expense records",
};
