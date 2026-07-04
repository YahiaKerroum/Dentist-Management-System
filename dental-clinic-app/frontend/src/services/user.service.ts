import { UserResponse, UpdateUserDTO, CreateUserDTO, Role, User } from '../types/user';
import { apiClient, authHeader } from '../lib/apiClient';

const RESOURCE = '/users';

export const getUserProfile = async (token: string): Promise<UserResponse> => {
  const { data } = await apiClient.get(`${RESOURCE}/me`, { headers: authHeader(token) });
  return data;
};

export const updateUserProfile = async (data: UpdateUserDTO, token: string): Promise<UserResponse> => {
  const { data: body } = await apiClient.put(`${RESOURCE}/me`, data, { headers: authHeader(token) });
  return body;
};

// Staff Management Functions

export const getAllStaff = async (
  token: string,
  filters?: { role?: Role; search?: string }
): Promise<{ success: boolean; data: User[] }> => {
  const { data } = await apiClient.get(RESOURCE, { params: filters, headers: authHeader(token) });
  return data;
};

export const getStaffById = async (id: string, token: string): Promise<{ success: boolean; data: UserResponse }> => {
  const { data } = await apiClient.get(`${RESOURCE}/${id}`, { headers: authHeader(token) });
  return data;
};

export const createStaff = async (
  data: CreateUserDTO,
  token: string
): Promise<{ success: boolean; data: UserResponse }> => {
  const { data: body } = await apiClient.post(RESOURCE, data, { headers: authHeader(token) });
  return body;
};

export const updateStaff = async (
  id: string,
  data: UpdateUserDTO,
  token: string
): Promise<{ success: boolean; data: UserResponse }> => {
  const { data: body } = await apiClient.put(`${RESOURCE}/${id}`, data, { headers: authHeader(token) });
  return body;
};

export const deleteStaff = async (id: string, token: string): Promise<{ success: boolean; message: string }> => {
  const { data } = await apiClient.delete(`${RESOURCE}/${id}`, { headers: authHeader(token) });
  return data;
};

// Permissions management
export const getUserPermissions = async (id: string, token: string): Promise<{ success: boolean; data: string[] }> => {
  const { data } = await apiClient.get(`${RESOURCE}/${id}/permissions`, { headers: authHeader(token) });
  return data;
};

export const grantUserPermission = async (
  id: string,
  permissionName: string,
  token: string
): Promise<{ success: boolean; message?: string }> => {
  const { data } = await apiClient.post(
    `${RESOURCE}/${id}/permissions`,
    { permissionName },
    { headers: authHeader(token) }
  );
  return data;
};

export const revokeUserPermission = async (
  id: string,
  permissionName: string,
  token: string
): Promise<{ success: boolean; message?: string }> => {
  const { data } = await apiClient.delete(`${RESOURCE}/${id}/permissions/${encodeURIComponent(permissionName)}`, {
    headers: authHeader(token),
  });
  return data;
};
