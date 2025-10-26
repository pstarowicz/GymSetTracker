import { axiosInstance } from '../utils/axios';

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const changePassword = async (data: ChangePasswordData): Promise<void> => {
  await axiosInstance.post('/api/users/me/change-password', data);
};