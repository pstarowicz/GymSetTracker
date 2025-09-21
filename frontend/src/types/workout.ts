import { Exercise } from './exercise';

export interface Workout {
    id: number;
    userId: number;
    date: string;
    duration?: number;
    notes?: string;
    createdAt: string;
    sets: WorkoutSet[];
}

export interface WorkoutSet {
    id: number;
    workoutId: number;
    exerciseId: number;
    exercise?: Exercise;
    setNumber: number;
    weight: number;
    reps: number;
    createdAt: string;
}

export interface WorkoutRequest {
    date: string;
    duration?: number;
    notes?: string;
    sets: WorkoutSetRequest[];
}

export interface WorkoutSetRequest {
    exerciseId: number;
    setNumber: number;
    reps: number;
    weight: number;
}
