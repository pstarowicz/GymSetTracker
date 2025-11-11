import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { 
  Typography, 
  Paper, 
  Box, 
  Button, 
  Dialog,
  DialogTitle,
  DialogContent,
  
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
import { Workout } from '@/types/workout';
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
  const [page] = useState(0);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
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

  // Helpers moved into component scope for easier access to types/state if needed later
  const formatWorkoutDate = (w: Workout) => {
    if (!Array.isArray(w.date) || w.date.length < 3) return '';
    try {
      return new Date(w.date[0], w.date[1] - 1, w.date[2]).toLocaleDateString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch (e) {
      return '';
    }
  };

  // (time formatting inline in the UI where needed)

  // Exercises are loaded with React Query below.

  // Use React Query for workouts and exercises. Keep local state for UI-level filters/search.
  const queryClient = useQueryClient();

  // 1) Page-based workouts (initial list)
  const { data: pageData, isLoading: isPageLoading } = useQuery(
    ['workouts', page],
    () => workoutService.getWorkouts(page).then(res => res.data),
    {
      staleTime: 1000 * 60, // 1 minute
      onSuccess: (data) => {
        const fetchedWorkouts: Workout[] = data?.content || [];
        // Apply current searchText locally
        if (searchText.trim()) {
          const searchLower = searchText.toLowerCase();
          const filtered = (fetchedWorkouts || []).filter(workout => {
            const notesMatch = workout.notes?.toLowerCase().includes(searchLower);
            const exerciseMatch = workout.sets?.some((set: any) => set.exercise?.name?.toLowerCase().includes(searchLower));
            const dateStr = formatWorkoutDate(workout).toLowerCase();
            const dateMatch = dateStr.includes(searchLower);
            return Boolean(notesMatch || exerciseMatch || dateMatch);
          });
          setWorkouts(filtered);
        } else {
          setWorkouts(fetchedWorkouts);
        }

        // Compute and set default date range from initial results, but do NOT trigger a refetch
        if (!defaultDatesSet && fetchedWorkouts.length > 0) {
          const lastWorkout = fetchedWorkouts[0];
          if (Array.isArray(lastWorkout.date) && lastWorkout.date.length >= 3) {
            const lastWorkoutDate = new Date(lastWorkout.date[0], lastWorkout.date[1] - 1, lastWorkout.date[2]);
            const startDate = new Date(lastWorkoutDate);
            startDate.setFullYear(startDate.getFullYear() - 1);
            // set dateRange for UI only; we don't include dateRange in query keys so no immediate refetch
            setDateRange({ start: startDate, end: lastWorkoutDate });
            setDefaultDatesSet(true);
          }
        }
      }
    }
  );

  // 2) Workouts between dates (enabled when user sets both start & end explicitly)
  const startStr = dateRange.start ? `${dateRange.start.getFullYear()}-${String(dateRange.start.getMonth() + 1).padStart(2, '0')}-${String(dateRange.start.getDate()).padStart(2, '0')}T00:00:00` : '';
  const endStr = dateRange.end ? `${dateRange.end.getFullYear()}-${String(dateRange.end.getMonth() + 1).padStart(2, '0')}-${String(dateRange.end.getDate()).padStart(2, '0')}T23:59:59` : '';

  const { data: betweenData, isLoading: isBetweenLoading } = useQuery(
    ['workouts-between', startStr, endStr],
    () => workoutService.getWorkoutsBetweenDates(dateRange.start as Date, dateRange.end as Date).then(res => res.data),
    {
      enabled: Boolean(dateRange.start && dateRange.end && defaultDatesSet),
      onSuccess: (data) => {
        setWorkouts(data || []);
      }
    }
  );

  // 3) Workouts for single date (enabled when user selects singleDate)
  const singleDateStr = singleDate ? `${singleDate.getFullYear()}-${String(singleDate.getMonth() + 1).padStart(2, '0')}-${String(singleDate.getDate()).padStart(2, '0')}T00:00:00` : '';
  const { data: dateData, isLoading: isDateLoading } = useQuery(
    ['workouts-date', singleDateStr],
    () => workoutService.getWorkoutsByDate(singleDate as Date).then(res => res.data),
    {
      enabled: Boolean(singleDate),
      onSuccess: (data) => {
        setWorkouts(data || []);
      }
    }
  );

  // Exercises via React Query
  const { data: exercisesData, isLoading: isExercisesLoading } = useQuery('exercises', () => exerciseService.getAllExercises(), {
    staleTime: 1000 * 60,
    onSuccess: (data) => setExercises(data || [])
  });

  // Combined loading state
  useEffect(() => {
    setLoading(Boolean(isPageLoading || isBetweenLoading || isDateLoading || isExercisesLoading));
  }, [isPageLoading, isBetweenLoading, isDateLoading, isExercisesLoading]);

  // Apply search filtering (debounced) to whichever source of workouts is active
  useEffect(() => {
    const sourceWorkouts: Workout[] = singleDate
      ? (dateData || [])
      : (dateRange.start && dateRange.end)
        ? (betweenData || [])
        : (pageData?.content || []);

    const applyFilter = () => {
      if (!searchText || !searchText.trim()) {
        setWorkouts(sourceWorkouts);
        return;
      }

      const s = searchText.toLowerCase();
      const filtered = (sourceWorkouts || []).filter(workout => {
        const notesMatch = workout.notes?.toLowerCase().includes(s);
        const exerciseMatch = workout.sets?.some((set: any) => set.exercise?.name?.toLowerCase().includes(s));
        const dateStr = formatWorkoutDate(workout).toLowerCase();
        const dateMatch = dateStr.includes(s);
        return Boolean(notesMatch || exerciseMatch || dateMatch);
      });

      setWorkouts(filtered);
    };

    const t = setTimeout(applyFilter, 300);
    return () => clearTimeout(t);
  }, [searchText, pageData, betweenData, dateData, singleDate, dateRange.start, dateRange.end]);

  

  // (exercise loading handled in the mount effect above)

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
    if (!window.confirm('Are you sure you want to delete this workout?')) return;
    try {
      await workoutService.deleteWorkout(id);
      // Invalidate queries so React Query will refetch updated lists
      queryClient.invalidateQueries('workouts');
      queryClient.invalidateQueries('workouts-between');
      queryClient.invalidateQueries('workouts-date');
    } catch (error) {
      console.error('Failed to delete workout:', error);
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
                // Invalidate queries so the lists will be refetched
                queryClient.invalidateQueries('workouts');
                queryClient.invalidateQueries('workouts-between');
                queryClient.invalidateQueries('workouts-date');
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
