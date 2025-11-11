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

  const calculateYDomain = (values: number[]) => {
    if (values.length === 0) return [0, 10];
    const min = Math.min(...values);
    const max = Math.max(...values);
    if (min === max) {
      // If there's only one value or all values are the same
      return [min - min * 0.1, max + max * 0.1];
    }
    const range = max - min;
    return [min - range * 0.1, max + range * 0.1];
  };

  const maxWeightDomain = calculateYDomain(formattedData.map(d => d.maxWeight));
  const volumeDomain = calculateYDomain(formattedData.map(d => d.volume));

  return (
    <Box data-test-id={`chart--exercise-history--${exerciseId}`}>
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        {exerciseName} Progress
      </Typography>
      
      {/* Max Weight Graph */}
  <Paper data-test-id={`chart--exercise-history--${exerciseId}--max-weight`} sx={{ p: 2, mb: 2 }} elevation={0} variant="outlined">
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
              domain={maxWeightDomain}
              scale="linear"
              allowDataOverflow={false}
              tickCount={8}
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
  <Paper data-test-id={`chart--exercise-history--${exerciseId}--volume`} sx={{ p: 2 }} elevation={0} variant="outlined">
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
              domain={volumeDomain}
              scale="linear"
              allowDataOverflow={false}
              tickCount={8}
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