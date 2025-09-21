import { axiosInstance } from '../utils/axios';
import { Exercise } from '../types/exercise';

export const exerciseService = {
  getAllExercises: async (): Promise<Exercise[]> => {
    const response = await axiosInstance.get('/api/exercises');
    return response.data;
  },

  getExercise: async (id: number): Promise<Exercise> => {
    const response = await axiosInstance.get(`/api/exercises/${id}`);
    return response.data;
  },

  createExercise: async (exerciseData: { name: string; muscleGroup: string }): Promise<Exercise> => {
    const response = await axiosInstance.post('/api/exercises', exerciseData);
    return response.data;
  },

  updateExercise: async (id: number, exerciseData: { name: string; muscleGroup: string }): Promise<Exercise> => {
    const response = await axiosInstance.put(`/api/exercises/${id}`, exerciseData);
    return response.data;
  },

  deleteExercise: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/exercises/${id}`);
  }
};
