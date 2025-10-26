import { Typography, Paper, Box, Grid, TextField, Button } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '@/services/profile.service';

interface ProfileData {
  name: string;
  email: string;
  weight: number;
  height: number;
}

export const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfileData(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async () => {
    if (!profileData) return;

    setIsLoading(true);
    try {
      const updatedProfile = await updateProfile(profileData);
      setProfileData(updatedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof ProfileData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!profileData) return;

    let value: string | number = event.target.value;
    if (field === 'weight' || field === 'height') {
      value = parseFloat(value) || 0;
    }

    setProfileData({
      ...profileData,
      [field]: value
    });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      <Paper sx={{ p: 3 }}>
        {profileData && (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={profileData.name}
                onChange={handleChange('name')}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                value={profileData.email}
                onChange={handleChange('email')}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Weight (kg)"
                type="number"
                value={profileData.weight}
                onChange={handleChange('weight')}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Height (cm)"
                type="number"
                value={profileData.height}
                onChange={handleChange('height')}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12}>
              {isEditing ? (
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={isLoading}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setIsEditing(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </Box>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              )}
            </Grid>
          </Grid>
        )}
      </Paper>
    </Box>
  );
};
