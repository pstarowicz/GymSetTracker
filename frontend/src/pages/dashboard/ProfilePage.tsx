import { Typography, Paper, Box, Grid, TextField, Button } from '@mui/material';
import { useAuth } from '@/context/AuthContext';

export const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Name"
              defaultValue={user?.name}
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              defaultValue={user?.email}
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Weight (kg)"
              type="number"
              defaultValue={user?.weight}
              disabled
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Height (cm)"
              type="number"
              defaultValue={user?.height}
              disabled
            />
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="primary">
              Edit Profile
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};
