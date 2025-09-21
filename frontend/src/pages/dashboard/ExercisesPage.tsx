import { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { exerciseService } from '../../services/exercise.service';
import { Exercise } from '../../types/exercise';

const muscleGroups = [
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core',
  'Full Body',
  'Other'
];

export const ExercisesPage = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [open, setOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    muscleGroup: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const data = await exerciseService.getAllExercises();
      setExercises(data);
    } catch (err) {
      setError('Failed to load exercises');
    }
  };

  const handleOpen = (exercise?: Exercise) => {
    if (exercise) {
      setEditingExercise(exercise);
      setFormData({
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
      });
    } else {
      setEditingExercise(null);
      setFormData({
        name: '',
        muscleGroup: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingExercise(null);
    setFormData({ name: '', muscleGroup: '' });
    setError('');
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.muscleGroup) {
        setError('Please fill in all fields');
        return;
      }

      if (editingExercise) {
        await exerciseService.updateExercise(editingExercise.id, formData);
      } else {
        await exerciseService.createExercise(formData);
      }
      
      handleClose();
      loadExercises();
    } catch (err) {
      setError('Failed to save exercise');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this exercise?')) {
      try {
        await exerciseService.deleteExercise(id);
        loadExercises();
      } catch (err) {
        setError('Failed to delete exercise');
      }
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Exercises</Typography>
        <Button variant="contained" color="primary" onClick={() => handleOpen()}>
          Add Exercise
        </Button>
      </Box>

      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Muscle Group</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exercises.map((exercise) => (
              <TableRow key={exercise.id}>
                <TableCell>{exercise.name}</TableCell>
                <TableCell>{exercise.muscleGroup}</TableCell>
                <TableCell>{exercise.isCustom ? 'Custom' : 'Default'}</TableCell>
                <TableCell align="right">
                  <IconButton 
                    onClick={() => handleOpen(exercise)}
                    disabled={!exercise.isCustom}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDelete(exercise.id)}
                    disabled={!exercise.isCustom}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editingExercise ? 'Edit Exercise' : 'Add New Exercise'}
        </DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              fullWidth
              label="Exercise Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              select
              label="Muscle Group"
              value={formData.muscleGroup}
              onChange={(e) => setFormData({ ...formData, muscleGroup: e.target.value })}
              margin="normal"
            >
              {muscleGroups.map((group) => (
                <MenuItem key={group} value={group}>
                  {group}
                </MenuItem>
              ))}
            </TextField>
            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingExercise ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
