import { useState, useEffect, useMemo } from 'react';
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
  FormControl,
  InputLabel,
  Select,
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

interface Filters {
  search: string;
  muscleGroup: string;
  type: string;
}

export const ExercisesPage = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [open, setOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    muscleGroup: '',
    type: ''
  });

  const filteredExercises = useMemo(() => {
    return exercises.filter(exercise => {
      const matchesSearch = exercise.name.toLowerCase().includes(filters.search.toLowerCase());
      const matchesMuscleGroup = !filters.muscleGroup || exercise.muscleGroup === filters.muscleGroup;
      const matchesType = !filters.type || 
        (filters.type === 'custom' ? exercise.isCustom : !exercise.isCustom);
      return matchesSearch && matchesMuscleGroup && matchesType;
    });
  }, [exercises, filters]);
  
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      width: '100%',
      padding: '0 24px',
    },
    tableContainer: {
      margin: '24px 0',
    },
  };
  
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
    <Box sx={styles.container}>
      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">Exercises</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => handleOpen()}
            size="large"
            startIcon={<EditIcon />}
          >
            Add Exercise
          </Button>
        </Box>

        <Paper sx={{ p: 2 }}>
          <Box display="flex" gap={2}>
            <TextField
              label="Search exercises"
              variant="outlined"
              size="small"
              fullWidth
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search by name..."
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="muscle-group-label" size="small">Muscle Group</InputLabel>
              <Select
                labelId="muscle-group-label"
                value={filters.muscleGroup}
                size="small"
                label="Muscle Group"
                onChange={(e) => setFilters(prev => ({ ...prev, muscleGroup: e.target.value }))}
              >
                <MenuItem value="">All</MenuItem>
                {muscleGroups.map((group) => (
                  <MenuItem key={group} value={group}>{group}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel id="type-label" size="small">Type</InputLabel>
              <Select
                labelId="type-label"
                value={filters.type}
                size="small"
                label="Type"
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="default">Default</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              onClick={() => setFilters({ search: '', muscleGroup: '', type: '' })}
            >
              Clear Filters
            </Button>
          </Box>
        </Paper>
      </Box>

      {error && (
        <Typography color="error" mb={2}>
          {error}
        </Typography>
      )}

      <TableContainer component={Paper} sx={styles.tableContainer}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600 }}>Muscle Group</TableCell>
              <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600 }}>Type</TableCell>
              <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredExercises.map((exercise) => (
              <TableRow key={exercise.id}>
                <TableCell sx={{ fontSize: '1.05rem' }}>{exercise.name}</TableCell>
                <TableCell sx={{ fontSize: '1.05rem' }}>{exercise.muscleGroup}</TableCell>
                <TableCell sx={{ fontSize: '1.05rem' }}>
                  <Box
                    component="span"
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: exercise.isCustom ? 'primary.light' : 'secondary.light',
                      color: '#fff',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                  >
                    {exercise.isCustom ? 'Custom' : 'Default'}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <IconButton 
                    onClick={() => handleOpen(exercise)}
                    disabled={!exercise.isCustom}
                    color="primary"
                    size="large"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDelete(exercise.id)}
                    disabled={!exercise.isCustom}
                    color="error"
                    size="large"
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
