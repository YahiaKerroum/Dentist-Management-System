import { UserResponse, UpdateUserDTO } from '../types/user';

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
