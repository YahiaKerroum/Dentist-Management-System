import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addExpensePermissions() {
  console.log("🔧 Adding expense permissions...");

  try {
    // 1. Create expense permissions if they don't exist
    const expensePermissions = [
      "expenses.view",
      "expenses.create",
      "expenses.update",
      "expenses.delete",
      "expenses.approve",
    ];

    for (const permName of expensePermissions) {
      const perm = await prisma.permission.upsert({
        where: { name: permName },
        update: {},
        create: { name: permName },
      });
      console.log(`✅ Created/verified permission: ${permName}`);
    }

    // 2. Get the manager user
    const manager = await prisma.user.findFirst({
      where: { role: "MANAGER" },
    });

    if (!manager) {
      console.log("❌ No manager found in database");
      return;
    }

    console.log(`\n📋 Found manager: ${manager.firstName} ${manager.lastName} (${manager.email})`);

    // 3. Grant expense permissions to manager
    for (const permName of expensePermissions) {
      const permission = await prisma.permission.findUnique({
        where: { name: permName },
      });

      if (!permission) continue;

      // Check if user already has this permission
      const existing = await prisma.userPermission.findFirst({
        where: {
          userId: manager.id,
          permissionId: permission.id,
        },
      });

      if (existing) {
        console.log(`⏭️  Manager already has: ${permName}`);
        continue;
      }

      // Grant the permission
      await prisma.userPermission.create({
        data: {
          userId: manager.id,
          permissionId: permission.id,
        },
      });

      console.log(`✅ Granted permission: ${permName}`);
    }

    // 4. Verify permissions
    const userPermissions = await prisma.userPermission.findMany({
      where: { userId: manager.id },
      include: { permission: true },
    });

    console.log(`\n✅ Manager now has ${userPermissions.length} total permissions:`);
    const expensePerms = userPermissions
      .filter((up) => up.permission.name.startsWith("expenses."))
      .map((up) => up.permission.name);
    
    console.log("Expense permissions:", expensePerms);

    console.log("\n🎉 Done! Manager can now access expenses.");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

addExpensePermissions();
