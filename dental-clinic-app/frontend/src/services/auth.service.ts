import { LoginResponse } from '../types/auth';
import { apiClient, ApiError } from '../lib/apiClient';

export const login = async (username: string, password: string): Promise<LoginResponse> => {
    try {
        const { data } = await apiClient.post('/auth/login', { username, password });
        return data;
    } catch (err) {
        throw new Error(err instanceof ApiError ? err.message : 'Login failed');
    }
};
