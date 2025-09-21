import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Typography, 
  Paper, 
  Box, 
  Button, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { workoutService } from '@/services/workout.service';
import { Workout, WorkoutRequest } from '@/types/workout';
import { Exercise } from '@/types/exercise';
import { exerciseService } from '@/services/exercise.service';
import { WorkoutForm } from '@/components/workouts/WorkoutForm';

export const WorkoutsPage = () => {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    loadWorkouts();
    loadExercises();
  }, [page]);

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      console.log('Loading workouts for page:', page);
      const response = await workoutService.getWorkouts(page);
      console.log('Received workouts:', response.data);
      setWorkouts(response.data.content);
      setTotalElements(response.data.totalElements);
    } catch (error) {
      console.error('Failed to load workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExercises = async () => {
    try {
      const exercises = await exerciseService.getAllExercises();
      setExercises(exercises);
    } catch (error) {
      console.error('Failed to load exercises:', error);
    }
  };

  const handleCreateWorkout = () => {
    setSelectedWorkout(null);
    setOpenDialog(true);
  };

  const handleEditWorkout = (workout: Workout) => {
    setSelectedWorkout(workout);
    setOpenDialog(true);
  };

  const handleDeleteWorkout = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      try {
        await workoutService.deleteWorkout(id);
        loadWorkouts();
      } catch (error) {
        console.error('Failed to delete workout:', error);
      }
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Workouts</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateWorkout}
        >
          New Workout
        </Button>
      </Box>

      {loading ? (
        <Typography>Loading workouts...</Typography>
      ) : workouts.length === 0 ? (
        <Typography>No workouts found. Create your first workout!</Typography>
      ) : (
        <Paper elevation={2}>
          <List>
            {workouts.map((workout, index) => (
              <>
                {index > 0 && <Divider />}
                <ListItem
                  key={workout.id}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                  onClick={() => navigate(`/workouts/${workout.id}`)}
                >
                  <ListItemText
                    primary={
                      <Typography variant="h6">
                        {new Date(workout.date).toLocaleDateString(undefined, { 
                          weekday: 'long',
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Time: {new Date(workout.date).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Duration: {workout.duration || 0} minutes | Sets: {workout.sets?.length || 0}
                        </Typography>
                        {workout.notes && (
                          <Typography variant="body2" color="text.secondary">
                            Notes: {workout.notes}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditWorkout(workout);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWorkout(workout.id);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </>
            ))}
          </List>
        </Paper>
      )}

      {/* Workout Form Dialog will be implemented next */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedWorkout ? 'Edit Workout' : 'New Workout'}
        </DialogTitle>
        <DialogContent>
          <WorkoutForm
            workout={selectedWorkout || undefined}
            exercises={exercises}
            onSubmit={async (workoutData) => {
              try {
                if (selectedWorkout) {
                  await workoutService.updateWorkout(selectedWorkout.id, workoutData);
                } else {
                  await workoutService.createWorkout(workoutData);
                }
                loadWorkouts();
                setOpenDialog(false);
              } catch (error) {
                console.error('Failed to save workout:', error);
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};
