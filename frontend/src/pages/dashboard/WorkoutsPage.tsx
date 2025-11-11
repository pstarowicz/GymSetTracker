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
  TableRow,
  TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
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
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });
  const [singleDate, setSingleDate] = useState<Date | null>(null);
  const [defaultDatesSet, setDefaultDatesSet] = useState(false);

  // Custom styles for the workout page
  const styles = {
    workoutList: {
      margin: '24px 0',
      '& .MuiListItem-root': {
        padding: '16px 24px',
      }
    },
    setsList: {
      '& .MuiTableCell-root': {
        fontSize: '1.05rem',
        padding: '16px 24px',
      },
    },
  };

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

  // Initial load effect
  useEffect(() => {
    if (!defaultDatesSet) {
      loadWorkouts();
      loadExercises();
    }
  }, []); // Run only once on mount

  // Regular update effect
  useEffect(() => {
    if (defaultDatesSet) {
      loadWorkouts();
      loadExercises();
    }
  }, [page, dateRange.start, dateRange.end, singleDate, defaultDatesSet]);

  // Debounced text search
  useEffect(() => {
    const handler = setTimeout(() => {
      loadWorkouts();
    }, 300);

    return () => clearTimeout(handler);
  }, [searchText]);

  const loadWorkouts = async () => {
    try {
      setLoading(true);
      let response;
      let fetchedWorkouts: Workout[] = [];

      if (singleDate) {
        // If single date is selected, use that
        response = await workoutService.getWorkoutsByDate(singleDate);
        fetchedWorkouts = response.data || [];
      } else if (dateRange.start && dateRange.end) {
        // If date range is selected, use that
        response = await workoutService.getWorkoutsBetweenDates(
          dateRange.start,
          dateRange.end
        );
        fetchedWorkouts = response.data || [];
      } else {
        // If no dates selected, show paginated list
        response = await workoutService.getWorkouts(page);
        fetchedWorkouts = response.data.content || [];

        // Set default date range if not already set and we have workouts
        if (!defaultDatesSet && fetchedWorkouts.length > 0) {
          const lastWorkout = fetchedWorkouts[0]; // First workout is the most recent due to sorting
          const lastWorkoutDate = new Date(
            lastWorkout.date[0],
            lastWorkout.date[1] - 1,
            lastWorkout.date[2]
          );
          
          // Set end date to last workout date
          const endDate = lastWorkoutDate;
          
          // Set start date to one year before the last workout
          const startDate = new Date(lastWorkoutDate);
          startDate.setFullYear(startDate.getFullYear() - 1);
          
          setDateRange({
            start: startDate,
            end: endDate
          });
          setDefaultDatesSet(true);
        }
      }

      // Apply text filter locally across notes, exercise names and displayed date
      if (searchText.trim()) {
        const searchLower = searchText.toLowerCase();
        const filtered = (fetchedWorkouts || []).filter(workout => {
          const notesMatch = workout.notes?.toLowerCase().includes(searchLower);

          const exerciseMatch = workout.sets?.some((set: any) =>
            set.exercise?.name?.toLowerCase().includes(searchLower)
          );

          let dateStr = '';
          if (Array.isArray(workout.date) && workout.date.length >= 3) {
            try {
              dateStr = new Date(
                workout.date[0],
                workout.date[1] - 1,
                workout.date[2]
              ).toLocaleDateString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
            } catch (e) {
              dateStr = '';
            }
          }
          const dateMatch = dateStr.toLowerCase().includes(searchLower);

          return Boolean(notesMatch || exerciseMatch || dateMatch);
        });

        setWorkouts(filtered);
      } else {
        setWorkouts(fetchedWorkouts);
      }
    } catch (error: any) {
      console.error('Failed to load workouts:', error);
      if (error.response?.status === 403) {
        console.log('Access forbidden. Token might be expired.');
      }
    } finally {
      setLoading(false);
    }
    };

  const loadExercises = async () => {
    try {
      const exerciseData = await exerciseService.getAllExercises();
      setExercises(exerciseData);
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
    const workoutCopy: Workout = {
      ...workout,
      id: 0, // Temporary ID that will be replaced when saved
      date: [
        now.getFullYear(),
        now.getMonth() + 1,
        now.getDate(),
        now.getHours(),
        now.getMinutes()
      ],
      sets: workout.sets?.map(set => ({
        ...set,
        id: 0, // Temporary ID that will be replaced when saved
        workoutId: 0, // Temporary ID that will be replaced when saved
        exerciseId: set.exerciseId,
        exercise: set.exercise,
        setNumber: set.setNumber,
        weight: set.weight,
        reps: set.reps,
        createdAt: new Date().toISOString()
      }))
    };
    setSelectedWorkout({ ...workoutCopy, isNew: true } as Workout);
    setOpenDialog(true);
  };

  const handleDeleteWorkout = async (id: number | undefined) => {
    if (!id) return;
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
    <div>
      <Box sx={{ mb: 3 }}>
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center"
          mb={2}
        >
          <Typography variant="h4">Workouts</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateWorkout}
            size="large"
          >
            New Workout
          </Button>
        </Box>
        
        <Paper sx={{ p: 2 }}>
          <Box display="flex" flexDirection="column" gap={2}>
            {/* Search and Clear Filters row */}
            <Box display="flex" gap={2} alignItems="center">
              <TextField
                label="Search workouts"
                variant="outlined"
                size="small"
                sx={{ flex: 1 }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search by notes or exercises..."
              />
              <Button 
                variant="outlined" 
                onClick={() => {
                  setDateRange({ start: null, end: null });
                  setSingleDate(null);
                  setSearchText('');
                }}
              >
                Clear Filters
              </Button>
            </Box>

            {/* Date filters with responsive layout */}
            <Box 
              sx={{ 
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' },
                gap: 2
              }}
            >
              {/* Single date section */}
              <Box display="flex" gap={2} alignItems="center">
                <Typography variant="subtitle2" color="textSecondary" sx={{ whiteSpace: 'nowrap' }}>Filter by:</Typography>
                <DatePicker
                  label="Single date"
                  value={singleDate}
                  onChange={(newValue) => {
                    setSingleDate(newValue);
                    if (newValue) {
                      setDateRange({ start: null, end: null });
                    }
                  }}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </Box>

              {/* Date range section */}
              <Box display="flex" gap={2} alignItems="center">
                <Typography variant="subtitle2" color="textSecondary" sx={{ whiteSpace: 'nowrap' }}>or date range:</Typography>
                <Box display="flex" gap={2} sx={{ flex: 1 }}>
                  <DatePicker
                    label="Start date"
                    value={dateRange.start}
                    onChange={(newValue) => {
                      setDateRange(prev => ({ ...prev, start: newValue }));
                      if (newValue) {
                        setSingleDate(null);
                      }
                    }}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                  <DatePicker
                    label="End date"
                    value={dateRange.end}
                    onChange={(newValue) => setDateRange(prev => ({ ...prev, end: newValue }))}
                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>

      {loading ? (
        <Typography>Loading workouts...</Typography>
      ) : workouts.length === 0 ? (
        <Typography>No workouts found. Create your first workout!</Typography>
      ) : (
        <Paper elevation={2} sx={styles.workoutList}>
          <List>
            {workouts.map((workout, index) => (
              <div key={workout.id}>
                {index > 0 && <Divider />}
                <ListItem
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                    onClick={() => workout.id && setExpandedWorkoutId(expandedWorkoutId === workout.id ? null : workout.id)}
                  >
                    <ListItemText
                      disableTypography
                      primary={
                        <Typography component="div" variant="body1">
                          <Box display="flex" alignItems="center">
                            <Box>
                              <Typography variant="h6" component="div" style={{ marginRight: '8px' }}>
                                {new Date(
                                  workout.date[0], 
                                  workout.date[1] - 1,
                                  workout.date[2]
                                ).toLocaleDateString(undefined, { 
                                  weekday: 'long',
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </Typography>
                              <Typography variant="caption" component="div">
                                ID: {workout.id}
                              </Typography>
                            </Box>
                            {expandedWorkoutId === workout.id ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                          </Box>
                        </Typography>
                      }
                      secondary={
                        <Typography component="div" variant="body2" color="text.secondary">
                          <Box>
                            <Typography component="div" variant="body2" color="text.secondary">
                              Time: {new Date(
                                workout.date[0], 
                                workout.date[1] - 1,
                                workout.date[2],
                                workout.date[3],
                                workout.date[4]
                              ).toLocaleTimeString(undefined, {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Typography>
                            <Typography component="div" variant="body2" color="text.secondary">
                              Duration: {workout.duration || 0} minutes | Sets: {workout.sets?.length || 0}
                            </Typography>
                            {workout.notes && (
                              <Typography component="div" variant="body2" color="text.secondary">
                                Notes: {workout.notes}
                              </Typography>
                            )}
                          </Box>
                        </Typography>
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
                      <Table size="medium" sx={styles.setsList}>
                        <TableHead>
                          <TableRow>
                            <TableCell 
                              sx={{ 
                                fontWeight: 600,
                                fontSize: '1.1rem !important'
                              }}
                            >
                              Exercise
                            </TableCell>
                            <TableCell 
                              align="right"
                              sx={{ 
                                fontWeight: 600,
                                fontSize: '1.1rem !important'
                              }}
                            >
                              Sets (Weight × Reps)
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {groupSetsByExercise(workout.sets).map((groupedSet) => (
                            <TableRow key={groupedSet.exerciseName}>
                              <TableCell sx={{ fontWeight: 500 }}>{groupedSet.exerciseName}</TableCell>
                              <TableCell align="right">
                                {groupedSet.sets.map((set, index) => (
                                  <Box 
                                    component="span" 
                                    key={set.id}
                                    sx={{
                                      display: 'inline-block',
                                      bgcolor: 'rgba(37, 99, 235, 0.08)',
                                      px: 1.5,
                                      py: 0.5,
                                      borderRadius: 1,
                                      ml: index > 0 ? 1 : 0,
                                      fontWeight: 500,
                                    }}
                                  >
                                    {set.weight}kg × {set.reps}
                                  </Box>
                                ))}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  </Collapse>
              </div>
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
    </div>
  );
};
