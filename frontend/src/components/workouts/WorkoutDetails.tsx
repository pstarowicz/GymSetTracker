import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Workout, WorkoutSet } from '@/types/workout';
import { workoutService } from '@/services/workout.service';
import { Exercise } from '@/types/exercise';

interface WorkoutDetailsProps {
  workoutId: number;
}

export const WorkoutDetails = ({ workoutId }: WorkoutDetailsProps) => {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWorkout();
  }, [workoutId]);

  const loadWorkout = async () => {
    try {
      setLoading(true);
      const response = await workoutService.getWorkout(workoutId);
      setWorkout(response.data);
    } catch (error) {
      console.error('Failed to load workout:', error);
      setError('Failed to load workout details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Typography>Loading workout details...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!workout) {
    return <Typography>Workout not found</Typography>;
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Workout Details
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Date:</strong> {new Date(workout.date).toLocaleString()}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Duration:</strong> {workout.duration} minutes
            </Typography>
          </Grid>
          {workout.notes && (
            <Grid item xs={12}>
              <Typography variant="body1">
                <strong>Notes:</strong> {workout.notes}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Typography variant="h6" gutterBottom>
        Sets
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Exercise</TableCell>
              <TableCell align="right">Weight (kg)</TableCell>
              <TableCell align="right">Reps</TableCell>
              <TableCell align="right">RPE</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {workout.sets.map((set, index) => (
              <TableRow key={index}>
                <TableCell>{(set.exercise as Exercise).name}</TableCell>
                <TableCell align="right">{set.weight}</TableCell>
                <TableCell align="right">{set.reps}</TableCell>
                <TableCell align="right">{set.rpe || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};