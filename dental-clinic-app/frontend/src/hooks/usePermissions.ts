import { useMemo } from 'react';
import { Permission } from '../types/permission';

/**
 * Custom hook for checking user permissions
 * @param userPermissions - Array of permission strings the user has
 */
export function usePermissions(userPermissions: string[]) {
  const hasPermission = useMemo(() => {
    return (permission: Permission | string): boolean => {
      return userPermissions.includes(permission);
    };
  }, [userPermissions]);

  const hasAnyPermission = useMemo(() => {
    return (permissions: (Permission | string)[]): boolean => {
      return permissions.some(permission => userPermissions.includes(permission));
    };
  }, [userPermissions]);

  const hasAllPermissions = useMemo(() => {
    return (permissions: (Permission | string)[]): boolean => {
      return permissions.every(permission => userPermissions.includes(permission));
    };
  }, [userPermissions]);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    permissions: userPermissions,
  };
}
