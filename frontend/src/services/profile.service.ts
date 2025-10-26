import { axiosInstance } from '../utils/axios';

interface ProfileData {
  name: string;
  email: string;
  weight: number;
  height: number;
}

export const getProfile = async (): Promise<ProfileData> => {
  const response = await axiosInstance.get('/api/users/me/profile');
  return response.data;
};

export const updateProfile = async (profileData: ProfileData): Promise<ProfileData> => {
  const response = await axiosInstance.put('/api/users/me/profile', profileData);
  return response.data;
};