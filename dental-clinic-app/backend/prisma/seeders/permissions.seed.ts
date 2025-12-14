import { PrismaClient, Role } from "@prisma/client";
import { Permission } from "../../src/types/permission.types";

const prisma = new PrismaClient();

const DEFAULT_ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.MANAGER]: [
    Permission.PATIENTS_VIEW,
    Permission.PATIENTS_CREATE,
    Permission.PATIENTS_UPDATE,
    Permission.PATIENTS_DELETE,
    Permission.TREATMENTS_VIEW,
    Permission.TREATMENTS_CREATE,
    Permission.TREATMENTS_UPDATE,
    Permission.TREATMENTS_DELETE,
    Permission.DOCUMENTS_VIEW,
    Permission.DOCUMENTS_CREATE,
    Permission.DOCUMENTS_UPDATE,
    Permission.DOCUMENTS_DELETE,
    Permission.APPOINTMENTS_VIEW,
    Permission.APPOINTMENTS_CREATE,
    Permission.APPOINTMENTS_UPDATE,
    Permission.APPOINTMENTS_CANCEL,
    Permission.PAYMENT_VIEW,
    Permission.PAYMENT_CREATE,
    Permission.PAYMENT_UPDATE,
    Permission.PAYMENT_DELETE,
  ],
  [Role.DOCTOR]: [
    Permission.PATIENTS_VIEW,
    Permission.PATIENTS_UPDATE,
    Permission.TREATMENTS_VIEW,
    Permission.TREATMENTS_CREATE,
    Permission.TREATMENTS_UPDATE,
    Permission.DOCUMENTS_VIEW,
    Permission.DOCUMENTS_CREATE,
    Permission.DOCUMENTS_UPDATE,
    Permission.APPOINTMENTS_VIEW,
    Permission.APPOINTMENTS_CREATE,
    Permission.APPOINTMENTS_UPDATE,
    Permission.APPOINTMENTS_CANCEL,
  ],
  [Role.ASSISTANT]: [
    Permission.PATIENTS_VIEW,
    Permission.DOCUMENTS_VIEW,
    Permission.APPOINTMENTS_VIEW,
    Permission.APPOINTMENTS_CREATE,
    Permission.APPOINTMENTS_UPDATE,
    Permission.PAYMENT_VIEW,
    Permission.PAYMENT_CREATE,
  ],
  [Role.RECEPTIONIST]: [
    Permission.PATIENTS_VIEW,
    Permission.DOCUMENTS_VIEW,
    Permission.APPOINTMENTS_VIEW,
    Permission.APPOINTMENTS_CREATE,
    Permission.APPOINTMENTS_UPDATE,
    Permission.PAYMENT_VIEW,
    Permission.PAYMENT_CREATE,
  ],
};

export async function seedPermissions() {
  // Upsert permissions
  const permissionEntries = Object.values(Permission);
  await prisma.$transaction(
    permissionEntries.map((name) =>
      prisma.permission.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  // Reset role permissions
  await prisma.rolePermission.deleteMany();

  // Seed role permissions
  for (const [role, perms] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
    for (const permName of perms) {
      const perm = await prisma.permission.findUnique({ where: { name: permName } });
      if (!perm) continue;
      await prisma.rolePermission.upsert({
        where: { role_permissionId: { role: role as Role, permissionId: perm.id } },
        update: {},
        create: { role: role as Role, permissionId: perm.id },
      });
    }
  }
}
