import { Box, Typography, Paper } from '@mui/material';
import { useQuery } from 'react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { personalRecordService, ExerciseHistory } from '@/services/personal-record.service';
import { format } from 'date-fns';

interface ExerciseHistoryGraphsProps {
  exerciseId: number;
  exerciseName: string;
}

export const ExerciseHistoryGraphs = ({ exerciseId, exerciseName }: ExerciseHistoryGraphsProps) => {
  const { data: history, isLoading } = useQuery({
    queryKey: ['exerciseHistory', exerciseId],
    queryFn: () => personalRecordService.getExerciseHistory(exerciseId),
    enabled: !!exerciseId,
  });

  if (isLoading) {
    return <Typography>Loading history...</Typography>;
  }

  if (!history?.length) {
    return (
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography>No history available for this exercise.</Typography>
      </Paper>
    );
  }

  const formattedData = history.map((record) => ({
    ...record,
    date: format(new Date(record.date), 'MMM d, yyyy'),
    maxWeight: Number(record.maxWeight.toFixed(1)),
    volume: Number(record.volume.toFixed(1))
  }));

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        {exerciseName} Progress
      </Typography>
      
      {/* Max Weight Graph */}
      <Paper sx={{ p: 2, mb: 2 }} elevation={0} variant="outlined">
        <Typography variant="h6" gutterBottom color="primary" sx={{ mb: 1 }}>
          Max Weight Progress
        </Typography>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#666' }}
              tickLine={{ stroke: '#666' }}
              height={40}
            />
            <YAxis 
              tick={{ fill: '#666' }}
              tickLine={{ stroke: '#666' }}
              label={{ 
                value: 'Weight (kg)', 
                angle: -90, 
                position: 'insideLeft',
                style: { fill: '#666' },
                offset: 0
              }}
              width={60}
            />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '8px 12px'
                }}
                formatter={(value: any, _name: string, item: any) => {
                  const data = item.payload as ExerciseHistory;
                  return [`${value}kg (×${data.maxWeightReps} reps)`, 'Max Weight'];
                }}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="maxWeight"
                stroke="#2196f3"
                strokeWidth={2}
                dot={{ stroke: '#2196f3', strokeWidth: 2, r: 4 }}
                name="Max Weight"
              />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {/* Volume Graph */}
      <Paper sx={{ p: 2 }} elevation={0} variant="outlined">
        <Typography variant="h6" gutterBottom color="primary">
          Volume Progress
        </Typography>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#666' }}
              tickLine={{ stroke: '#666' }}
              height={40}
            />
            <YAxis 
              tick={{ fill: '#666' }}
              tickLine={{ stroke: '#666' }}
              label={{ 
                value: 'Volume (kg)', 
                angle: -90, 
                position: 'insideLeft',
                style: { fill: '#666' },
                offset: 0
              }}
              width={60}
            />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '8px 12px'
                }}
                formatter={(value: any, _name: string, item: any) => {
                  const data = item.payload as ExerciseHistory;
                  return [`${value}kg (${data.volumeSets.join(' ')})`, 'Volume'];
                }}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="volume"
                stroke="#4caf50"
                strokeWidth={2}
                dot={{ stroke: '#4caf50', strokeWidth: 2, r: 4 }}
                name="Volume"
              />
          </LineChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};