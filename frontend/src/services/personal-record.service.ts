import { axiosInstance } from '@/utils/axios';

interface VolumeSetInfo {
  weight: number;
  reps: number;
  volumeContribution: number;
}

export interface PersonalRecord {
  exerciseId: number;
  exerciseName: string;
  maxWeight: number | null;
  maxWeightReps: number | null;
  maxWeightDate: string | null;
  maxVolume: number | null;
  maxVolumeDate: string | null;
  maxVolumeSets: VolumeSetInfo[] | null;
}

export interface ExerciseHistory {
  exerciseId: number;
  date: string; // ISO date-time string
  maxWeight: number;
  maxWeightReps: number;
  volume: number;
  volumeSets: string[];
}

class PersonalRecordService {
  async getPersonalRecords(): Promise<PersonalRecord[]> {
    const response = await axiosInstance.get<PersonalRecord[]>('/api/records');
    return response.data;
  }

  async getExerciseHistory(exerciseId: number): Promise<ExerciseHistory[]> {
    const response = await axiosInstance.get<ExerciseHistory[]>(`/api/records/exercise/${exerciseId}/history`);
    return response.data;
  }
}

export const personalRecordService = new PersonalRecordService();