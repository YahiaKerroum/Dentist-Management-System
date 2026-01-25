import prisma from "../config/prisma";
import { Permission } from "../types/permission.types";

/**
 * Check if a user has a specific permission
 * @param userId - The user's ID
 * @param requiredPermission - The permission to check
 * @returns true if user has the permission, false otherwise
 */
export async function userHasPermission(
  userId: string,
  requiredPermission: Permission
): Promise<boolean> {
  try {
    // Check if user has explicit permission
    const userPermission = await prisma.userPermission.findFirst({
      where: {
        userId,
        permission: {
          name: requiredPermission,
        },
      },
    });

    return !!userPermission;
  } catch (error) {
    console.error("Error checking user permission:", error);
    return false;
  }
}

/**
 * Check if a user has ALL of the specified permissions
 * @param userId - The user's ID
 * @param requiredPermissions - Array of permissions to check
 * @returns true if user has all permissions, false otherwise
 */
export async function userHasAllPermissions(
  userId: string,
  requiredPermissions: Permission[]
): Promise<boolean> {
  try {
    for (const permission of requiredPermissions) {
      const hasPermission = await userHasPermission(userId, permission);
      if (!hasPermission) {
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error("Error checking user permissions:", error);
    return false;
  }
}

/**
 * Check if a user has ANY of the specified permissions
 * @param userId - The user's ID
 * @param requiredPermissions - Array of permissions to check
 * @returns true if user has any permission, false otherwise
 */
export async function userHasAnyPermission(
  userId: string,
  requiredPermissions: Permission[]
): Promise<boolean> {
  try {
    for (const permission of requiredPermissions) {
      const hasPermission = await userHasPermission(userId, permission);
      if (hasPermission) {
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error("Error checking user permissions:", error);
    return false;
  }
}

/**
 * Get all permissions for a user
 * @param userId - The user's ID
 * @returns Array of permission names
 */
export async function getUserPermissions(userId: string): Promise<Permission[]> {
  try {
    const permissions = await prisma.userPermission.findMany({
      where: { userId },
      include: { permission: true },
    });

    return permissions.map((up): Permission => up.permission.name as Permission);
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    return [];
  }
}
