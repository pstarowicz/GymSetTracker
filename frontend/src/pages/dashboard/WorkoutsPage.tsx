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
  Divider,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, KeyboardArrowDown, KeyboardArrowUp, ContentCopy as CopyIcon } from '@mui/icons-material';
import { workoutService } from '@/services/workout.service';
import { Workout, WorkoutRequest } from '@/types/workout';
import { Exercise } from '@/types/exercise';
import { exerciseService } from '@/services/exercise.service';
import { WorkoutForm } from '@/components/workouts/WorkoutForm';

interface GroupedSet {
  exerciseName: string;
  sets: Array<{
    id: number;
    weight: number;
    reps: number;
  }>;
}

export const WorkoutsPage = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<number | null>(null);

  const groupSetsByExercise = (sets: any[] = []): GroupedSet[] => {
    const grouped = sets.reduce((acc: { [key: string]: GroupedSet }, set) => {
      const exerciseName = set.exercise?.name || 'Unknown exercise';
      if (!acc[exerciseName]) {
        acc[exerciseName] = {
          exerciseName,
          sets: []
        };
      }
      acc[exerciseName].sets.push({
        id: set.id,
        weight: set.weight || 0,
        reps: set.reps || 0
      });
      return acc;
    }, {});
    
    return Object.values(grouped);
  };

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
      const workouts = response.data.content;
      console.log('Sample workout date:', workouts[0]?.date);
      setWorkouts(workouts);
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

  const handleCopyWorkout = (workout: Workout) => {
    // Create a new workout object based on the selected one
    // but without the id and with current date
    const now = new Date();
    const workoutCopy = {
      ...workout,
      id: undefined,
      date: [
        now.getFullYear(),
        now.getMonth() + 1,
        now.getDate(),
        now.getHours(),
        now.getMinutes()
      ],
      sets: workout.sets?.map(set => ({
        ...set,
        id: undefined,
        workoutId: undefined
      }))
    };
    setSelectedWorkout({ ...workoutCopy, isNew: true }); // Add isNew flag
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
                <>
                  <ListItem
                    key={workout.id}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                    onClick={() => setExpandedWorkoutId(expandedWorkoutId === workout.id ? null : workout.id)}
                  >
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center">
                          <Box>
                            <Typography variant="h6" style={{ marginRight: '8px' }}>
                              {new Date(
                                workout.date[0], 
                                workout.date[1] - 1, // JavaScript months are 0-based
                                workout.date[2]
                              ).toLocaleDateString(undefined, { 
                                weekday: 'long',
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {workout.id}
                            </Typography>
                          </Box>
                          {expandedWorkoutId === workout.id ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Time: {new Date(
                              workout.date[0], 
                              workout.date[1] - 1, // JavaScript months are 0-based
                              workout.date[2],
                              workout.date[3],
                              workout.date[4]
                            ).toLocaleTimeString(undefined, {
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
                          handleCopyWorkout(workout);
                        }}
                        color="primary"
                      >
                        <CopyIcon />
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
                  <Collapse in={expandedWorkoutId === workout.id} timeout="auto" unmountOnExit>
                    <Box sx={{ px: 2, pb: 2 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Exercise</TableCell>
                            <TableCell align="right">Sets (Weight × Reps)</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {groupSetsByExercise(workout.sets).map((groupedSet) => (
                            <TableRow key={groupedSet.exerciseName}>
                              <TableCell>{groupedSet.exerciseName}</TableCell>
                              <TableCell align="right">
                                {groupedSet.sets.map((set, index) => (
                                  <span key={set.id}>
                                    {index > 0 ? ' | ' : ''}
                                    {set.weight}kg × {set.reps}
                                  </span>
                                ))}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  </Collapse>
                </>
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
          {selectedWorkout ? (selectedWorkout.id ? 'Edit Workout' : 'Copy Workout') : 'New Workout'}
        </DialogTitle>
        <DialogContent>
          <WorkoutForm
            workout={selectedWorkout || undefined}
            exercises={exercises}
            onSubmit={async (workoutData) => {
              try {
                // If workout exists and is not a copy (has an id and not marked as new), update it
                if (selectedWorkout && selectedWorkout.id && !selectedWorkout.isNew) {
                  await workoutService.updateWorkout(selectedWorkout.id, workoutData);
                } else {
                  // Otherwise create a new workout
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
