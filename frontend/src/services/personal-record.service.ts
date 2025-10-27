import { axiosInstance } from '@/utils/axios';

export interface PersonalRecord {
  exerciseId: number;
  exerciseName: string;
  maxWeight: number | null;
  maxWeightReps: number | null;
  maxWeightDate: string | null;
  maxVolume: number | null;
  maxVolumeDate: string | null;
}

class PersonalRecordService {
  async getPersonalRecords(): Promise<PersonalRecord[]> {
    const response = await axiosInstance.get<PersonalRecord[]>('/api/records');
    return response.data;
  }
}

export const personalRecordService = new PersonalRecordService();