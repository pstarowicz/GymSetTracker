import { axiosInstance } from '@/utils/axios';
import { Workout, WorkoutRequest } from '@/types/workout';

const BASE_URL = '/api/workouts';

export const workoutService = {
  createWorkout: (workout: WorkoutRequest) => {
    return axiosInstance.post<Workout>(BASE_URL, workout);
  },

  getWorkouts: (page = 0, size = 10) => {
    return axiosInstance.get<{ content: Workout[]; totalElements: number }>(
      `${BASE_URL}?page=${page}&size=${size}`
    );
  },

  getWorkout: (id: number) => {
    return axiosInstance.get<Workout>(`${BASE_URL}/${id}`);
  },

  updateWorkout: (id: number, workout: WorkoutRequest) => {
    return axiosInstance.put<Workout>(`${BASE_URL}/${id}`, workout);
  },

  deleteWorkout: (id: number) => {
    return axiosInstance.delete(`${BASE_URL}/${id}`);
  }
};
