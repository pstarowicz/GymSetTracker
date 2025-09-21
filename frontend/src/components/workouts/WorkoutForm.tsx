import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { WorkoutRequest, WorkoutSetRequest, Workout } from '@/types/workout';
import { Exercise } from '@/types/exercise';

interface WorkoutFormProps {
  workout?: Workout;
  exercises: Exercise[];
  onSubmit: (workout: WorkoutRequest) => void;
}

export const WorkoutForm = ({ workout, exercises, onSubmit }: WorkoutFormProps) => {
  const [formData, setFormData] = useState<WorkoutRequest>({
    date: new Date().toISOString().slice(0, 16), // Get date and time (YYYY-MM-DDThh:mm)
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
          workout.date[3],
          workout.date[4]
        );
        
        setFormData({
          date: date.toISOString().slice(0, 16),
          duration: workout.duration || 0,
          notes: workout.notes || '',
          sets: workout.sets?.map(set => ({
            exerciseId: set.exercise?.id || 0,
            reps: set.reps || 0,
            weight: set.weight || 0,
            setNumber: set.setNumber || 0,
          })) || [],
        });
      } catch (error) {
        console.error('Error parsing workout date:', error);
        // Fallback to current date if there's any error
        setFormData({
          date: new Date().toISOString().slice(0, 16),
          duration: workout.duration || 0,
          notes: workout.notes || '',
          sets: workout.sets?.map(set => ({
            exerciseId: set.exercise?.id || 0,
            reps: set.reps || 0,
            weight: set.weight || 0,
            setNumber: set.setNumber || 0,
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

  const handleSetChange = (index: number, field: keyof WorkoutSetRequest, value: number) => {
    setFormData(prev => ({
      ...prev,
      sets: prev.sets.map((set, i) =>
        i === index ? { ...set, [field]: value } : set
      ),
    }));
  };

  const addSet = () => {
    setFormData(prev => ({
      ...prev,
      sets: [
        ...prev.sets,
        {
          exerciseId: exercises[0]?.id || 0,
          reps: 0,
          weight: 0,
          setNumber: prev.sets.length + 1,
        },
      ],
    }));
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
          <TextField
            fullWidth
            type="datetime-local"
            name="date"
            label="Date and Time"
            value={formData.date}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
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
            <FormControl sx={{ flexGrow: 1 }}>
              <InputLabel>Exercise</InputLabel>
              <Select
                value={set.exerciseId}
                label="Exercise"
                onChange={(e) => handleSetChange(index, 'exerciseId', Number(e.target.value))}
              >
                {exercises.map((exercise) => (
                  <MenuItem key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              type="number"
              label="Reps"
              value={set.reps}
              onChange={(e) => handleSetChange(index, 'reps', parseInt(e.target.value))}
              sx={{ width: 100 }}
            />
            <TextField
              type="number"
              label="Weight"
              value={set.weight}
              onChange={(e) => handleSetChange(index, 'weight', parseInt(e.target.value))}
              sx={{ width: 100 }}
            />
            <IconButton onClick={() => removeSet(index)} color="error">
              <DeleteIcon />
            </IconButton>
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
          {workout ? 'Update Workout' : 'Create Workout'}
        </Button>
      </Box>
    </Box>
  );
};
