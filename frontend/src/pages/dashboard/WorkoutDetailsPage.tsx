import { useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import { WorkoutDetails } from '@/components/workouts/WorkoutDetails';

export const WorkoutDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const workoutId = parseInt(id || '0', 10);

  if (!workoutId) {
    return null;
  }

  return (
    <Box>
      <WorkoutDetails workoutId={workoutId} />
    </Box>
  );
};