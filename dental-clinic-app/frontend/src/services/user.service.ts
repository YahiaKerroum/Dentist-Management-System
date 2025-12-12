import { UserResponse, UpdateUserDTO, CreateUserDTO, Role, User } from '../types/user';

const API_URL = 'http://localhost:4000/api/users';

export const getUserProfile = async (token: string): Promise<UserResponse> => {
  try {
    const response = await fetch(`${API_URL}/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new Error('Failed to fetch user profile');
  }
};


export const updateUserProfile = async (
  data: UpdateUserDTO,
  token: string
): Promise<UserResponse> => {
  const response = await fetch(`${API_URL}/me`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update profile');
  }

  return response.json();
};

// Staff Management Functions

export const getAllStaff = async (
  token: string,
  filters?: { role?: Role; search?: string }
): Promise<{ success: boolean; data: User[] }> => {
  const params = new URLSearchParams();
  if (filters?.role) params.append('role', filters.role);
  if (filters?.search) params.append('search', filters.search);

  const response = await fetch(`${API_URL}${params.toString() ? `?${params.toString()}` : ''}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch staff');
  }

  return response.json();
};

export const getStaffById = async (
  id: string,
  token: string
): Promise<{ success: boolean; data: UserResponse }> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch staff member');
  }

  return response.json();
};

export const createStaff = async (
  data: CreateUserDTO,
  token: string
): Promise<{ success: boolean; data: UserResponse }> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create staff member');
  }

  return response.json();
};

export const updateStaff = async (
  id: string,
  data: UpdateUserDTO,
  token: string
): Promise<{ success: boolean; data: UserResponse }> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update staff member');
  }

  return response.json();
};

export const deleteStaff = async (
  id: string,
  token: string
): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to delete staff member');
  }

  return response.json();
};
