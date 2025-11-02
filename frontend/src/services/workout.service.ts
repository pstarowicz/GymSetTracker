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

  getWorkoutsBetweenDates: (start: Date, end: Date) => {
    // Format dates in local timezone
    const formatDate = (date: Date, isEndDate: boolean = false) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      // For end date, set time to end of day (23:59:59)
      const hours = isEndDate ? '23' : '00';
      const minutes = isEndDate ? '59' : '00';
      const seconds = isEndDate ? '59' : '00';
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    const startStr = formatDate(start);
    const endStr = formatDate(end, true); // Set end date to end of day

    console.log('Sending dates:', { startStr, endStr });

    return axiosInstance.get<Workout[]>(`${BASE_URL}/between`, {
      params: {
        start: startStr,
        end: endStr
      }
    });
  },

  getWorkoutsByDate: (date: Date) => {
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}T00:00:00`;
    };

    const dateStr = formatDate(date);
    console.log('Sending date:', dateStr);

    return axiosInstance.get<Workout[]>(`${BASE_URL}/date`, {
      params: {
        date: dateStr
      }
    });
  },

  updateWorkout: (id: number, workout: WorkoutRequest) => {
    return axiosInstance.put<Workout>(`${BASE_URL}/${id}`, workout);
  },

  deleteWorkout: (id: number) => {
    return axiosInstance.delete(`${BASE_URL}/${id}`);
  }
};
