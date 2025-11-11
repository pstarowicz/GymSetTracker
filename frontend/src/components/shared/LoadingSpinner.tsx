import { Box, CircularProgress } from '@mui/material';

export const LoadingSpinner = () => {
  return (
    <Box
      data-test-id="loading-spinner"
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100%'
      }}
    >
      <CircularProgress data-test-id="loading-spinner-progress" />
    </Box>
  );
};