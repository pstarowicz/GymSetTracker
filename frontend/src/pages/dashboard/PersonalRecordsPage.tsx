import { Typography, Paper, Box } from '@mui/material';

export const PersonalRecordsPage = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Personal Records
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Typography>Your personal records will appear here.</Typography>
      </Paper>
    </Box>
  );
};
