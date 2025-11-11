import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  IconButton,
  Typography,
  FormControl,
  Autocomplete,
  MenuItem,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { Add as AddIcon, Delete as DeleteIcon, ContentCopy as CopyIcon } from '@mui/icons-material';
import { WorkoutRequest, WorkoutSetRequest, Workout } from '@/types/workout';
import { Exercise } from '@/types/exercise';

interface WorkoutFormProps {
  workout?: Workout;
  exercises: Exercise[];
  onSubmit: (workout: WorkoutRequest) => void;
}

export const WorkoutForm = ({ workout, exercises, onSubmit }: WorkoutFormProps) => {
  type LocalSet = (WorkoutSetRequest & { muscleGroup?: string });

  const [formData, setFormData] = useState<WorkoutRequest & { workoutDate: Date; sets: LocalSet[] }>({
    date: new Date().toISOString().slice(0, 16),
    workoutDate: new Date(),
    duration: 0,
    notes: '',
    sets: [],
  });

  useEffect(() => {
    if (workout) {
      try {
        // Create date from the array format [year, month, day, hour, minute]
        const date = new Date(
          workout.date[0],
          workout.date[1] - 1, // JavaScript months are 0-based
          workout.date[2],
          workout.date[3] || 0,
          workout.date[4] || 0
        );

        // Format the date as YYYY-MM-DDThh:mm
        const formattedDate = date.toISOString().slice(0, 16);
        
        setFormData({
          date: formattedDate,
          workoutDate: date,
          duration: workout.duration || 0,
          notes: workout.notes || '',
          sets: workout.sets?.map(set => ({
              exerciseId: set.exercise?.id || 0,
              reps: set.reps || 0,
              weight: set.weight || 0,
              setNumber: set.setNumber || 0,
              muscleGroup: set.exercise?.muscleGroup || '',
            })) || [],
        });
      } catch (error) {
        console.error('Error parsing workout date:', error);
        // Fallback to current date if there's any error
        setFormData({
          date: new Date().toISOString().slice(0, 16),
          workoutDate: new Date(),
          duration: workout.duration || 0,
          notes: workout.notes || '',
          sets: workout.sets?.map(set => ({
            exerciseId: set.exercise?.id || 0,
            reps: set.reps || 0,
            weight: set.weight || 0,
            setNumber: set.setNumber || 0,
            muscleGroup: set.exercise?.muscleGroup || '',
          })) || [],
        });
      }
    }
  }, [workout]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? Number(value) : value,
    }));
  };

  const handleSetChange = (index: number, field: keyof WorkoutSetRequest | 'muscleGroup', value: any) => {
    setFormData(prev => {
      return {
        ...prev,
        sets: prev.sets.map((set, i) => {
          if (i !== index) return set;

          // When muscleGroup changes, pick a sensible exercise for that group (first match) or clear
          if (field === 'muscleGroup') {
            const mg = value as string;
            const match = exercises.find(e => e.muscleGroup === mg) || null;
            return {
              ...set,
              muscleGroup: mg,
              exerciseId: match ? match.id : 0,
            };
          }

          // When exerciseId changes, auto-set muscleGroup if not provided
          if (field === 'exerciseId') {
            const exId = Number(value) || 0;
            const ex = exercises.find(e => e.id === exId) || null;
            return {
              ...set,
              exerciseId: exId,
              muscleGroup: (set as any).muscleGroup || ex?.muscleGroup || '',
            };
          }

          return { ...set, [field]: value };
        }),
      };
    });
  };

  const addSet = () => {
    setFormData(prev => {
      const lastSet = prev.sets[prev.sets.length - 1];
      const defaultExerciseId = lastSet ? lastSet.exerciseId : exercises[0]?.id || 0;
      const defaultMuscleGroup = lastSet ? lastSet.muscleGroup || '' : '';
      return {
        ...prev,
        sets: [
          ...prev.sets,
          {
            exerciseId: defaultExerciseId,
            reps: 0,
            weight: 0,
            setNumber: prev.sets.length + 1,
            muscleGroup: defaultMuscleGroup,
          },
        ],
      };
    });
  };

  const removeSet = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sets: prev.sets.filter((_, i) => i !== index)
        .map((set, i) => ({ ...set, setNumber: i + 1 })),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <DateTimePicker
            label="Date and Time"
            value={formData.workoutDate}
            onChange={(newValue) => {
              if (newValue) {
                setFormData(prev => ({
                  ...prev,
                  workoutDate: newValue,
                  date: newValue.toISOString().slice(0, 16)
                }));
              }
            }}
            ampm={false}
            minutesStep={5}
            slotProps={{
              textField: {
                fullWidth: true,
                // prevent the picker from showing as if there's an error
                error: false,
                helperText: undefined,
              }
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            name="duration"
            label="Duration (minutes)"
            value={formData.duration}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={3}
            name="notes"
            label="Notes"
            value={formData.notes}
            onChange={handleChange}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Sets
        </Typography>
        {formData.sets.map((set, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
            <FormControl sx={{ width: 160 }}>
              <TextField
                select
                label="Muscle Group"
                value={(set as any).muscleGroup || ''}
                onChange={(e) => handleSetChange(index, 'muscleGroup', e.target.value)}
                fullWidth
                size="small"
              >
                <MenuItem value="">All</MenuItem>
                {Array.from(new Set(exercises.map(e => e.muscleGroup).filter(Boolean))).map(mg => (
                  <MenuItem key={mg} value={mg}>{mg}</MenuItem>
                ))}
              </TextField>
            </FormControl>

            <FormControl sx={{ flexGrow: 1 }}>
              <Autocomplete
                size="small"
                value={exercises.find(e => e.id === set.exerciseId) || null}
                options={exercises.filter(e => !(set as any).muscleGroup || e.muscleGroup === (set as any).muscleGroup)}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Exercise"
                    placeholder="Search exercise..."
                    size="small"
                  />
                )}
                onChange={(_, newValue) => {
                  handleSetChange(index, 'exerciseId', newValue?.id || 0);
                }}
                isOptionEqualToValue={(option, value) => !!value && option.id === value.id}
                slotProps={{
                  popper: {
                    // Force the popper to open below the input and disable flipping
                    placement: 'bottom-start',
                    modifiers: [{ name: 'flip', enabled: false } as any],
                  }
                }}
                fullWidth
              />
            </FormControl>
            <TextField
              type="number"
              label="Reps"
              size="small"
              value={set.reps}
              onChange={(e) => handleSetChange(index, 'reps', parseInt(e.target.value))}
              sx={{ width: 100 }}
            />
            <TextField
              type="number"
              label="Weight"
              size="small"
              value={set.weight}
              onChange={(e) => handleSetChange(index, 'weight', parseInt(e.target.value))}
              sx={{ width: 100 }}
            />
            <Box>
              <IconButton
                onClick={() => {
                  setFormData(prev => {
                    const newSet = {
                      exerciseId: prev.sets[index].exerciseId,
                      reps: prev.sets[index].reps,
                      weight: prev.sets[index].weight,
                      setNumber: prev.sets[index].setNumber + 1,
                      muscleGroup: (prev.sets[index] as any).muscleGroup || '',
                    };
                    
                    // Insert the new set after the current one and update all following set numbers
                    const updatedSets = [
                      ...prev.sets.slice(0, index + 1),
                      newSet,
                      ...prev.sets.slice(index + 1).map(set => ({
                        ...set,
                        setNumber: set.setNumber + 1,
                        muscleGroup: (set as any).muscleGroup || '',
                      }))
                    ];
                    
                    return {
                      ...prev,
                      sets: updatedSets,
                    };
                  });
                }}
                color="primary"
                sx={{ mr: 1 }}
              >
                <CopyIcon />
              </IconButton>
              <IconButton onClick={() => removeSet(index)} color="error">
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        ))}
        <Button
          startIcon={<AddIcon />}
          onClick={addSet}
          variant="outlined"
          sx={{ mt: 2 }}
        >
          Add Set
        </Button>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Button type="submit" variant="contained" fullWidth>
          {workout && !workout.isNew ? 'Update Workout' : 'Create Workout'}
        </Button>
      </Box>
    </Box>
  );
};
