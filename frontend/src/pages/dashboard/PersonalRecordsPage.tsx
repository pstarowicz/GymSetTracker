import { Typography, Paper, Box, Grid, Card, CardContent, Divider, Modal, TextField } from '@mui/material';
import { useQuery } from 'react-query';
import { personalRecordService } from '@/services/personal-record.service';
import { useState, useMemo } from 'react';
import { ExerciseHistoryGraphs } from '@/components/personal-records/ExerciseHistoryGraphs';

export const PersonalRecordsPage = () => {
  const [selectedExercise, setSelectedExercise] = useState<{ id: number; name: string } | null>(null);
  const [searchText, setSearchText] = useState('');
  const { data: records, isLoading } = useQuery({
    queryKey: ['personalRecords'],
    queryFn: () => personalRecordService.getPersonalRecords(),
  });

  const filteredRecords = useMemo(() => {
    if (!records || !searchText.trim()) return records;
    
    const searchLower = searchText.toLowerCase();
    return records.filter(record => 
      record.exerciseName.toLowerCase().includes(searchLower)
    );
  }, [records, searchText]);

  if (isLoading) {
    return <Typography>Loading records...</Typography>;
  }

  if (!records?.length) {
    return (
      <Box sx={{ mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4">Personal Records</Typography>
        </Box>
        <Paper sx={{ p: 2 }}>
          <Typography>No records yet. Start working out to see your personal records!</Typography>
        </Paper>
      </Box>
    );
  }

  const displayRecords = filteredRecords || records;

  return (
    <Box sx={{ mb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Personal Records</Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          label="Search exercises"
          variant="outlined"
          size="small"
          fullWidth
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search by exercise name..."
        />
      </Paper>
      <Grid container spacing={3}>
        {displayRecords.map((record) => (
          <Grid item xs={12} sm={6} md={4} key={record.exerciseId}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
              onClick={() => setSelectedExercise({ id: record.exerciseId, name: record.exerciseName })}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {record.exerciseName}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Max Weight
                  </Typography>
                  {record.maxWeight && record.maxWeightReps ? (
                    <>
                      <Typography variant="body1">
                        {record.maxWeight}kg (×{record.maxWeightReps} reps)
                      </Typography>
                      {record.maxWeightDate && (
                        <Typography variant="caption" color="text.secondary">
                          Achieved on {record.maxWeightDate}
                        </Typography>
                      )}
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No weight record yet
                    </Typography>
                  )}
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Max Volume
                  </Typography>
                  {record.maxVolume ? (
                    <>
                      <Typography variant="body1">
                        {record.maxVolume.toFixed(1)}kg
                      </Typography>
                      {record.maxVolumeSets && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {record.maxVolumeSets?.map((set, index) => (
                            <Box key={index} component="span" sx={{ display: 'inline' }}>
                              {`${set.weight}×${set.reps}`}
                              {index < (record.maxVolumeSets?.length ?? 0) - 1 ? ' ' : ''}
                            </Box>
                          ))}
                        </Typography>
                      )}
                      {record.maxVolumeDate && (
                        <Typography variant="caption" color="text.secondary">
                          Achieved on {record.maxVolumeDate}
                        </Typography>
                      )}
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No volume record yet
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Modal
        open={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
        aria-labelledby="exercise-history-modal"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '95%', sm: '85%', md: '80%' },
          maxWidth: 1000,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 3,
          borderRadius: 1,
        }}>
          {selectedExercise && (
            <ExerciseHistoryGraphs
              exerciseId={selectedExercise.id}
              exerciseName={selectedExercise.name}
            />
          )}
        </Box>
      </Modal>
    </Box>
  );
};
