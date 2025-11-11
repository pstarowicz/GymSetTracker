import { Typography, Paper, Box, Grid, TextField, Button } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '@/services/profile.service';
import { ChangePasswordForm } from '@/components/profile/ChangePasswordForm';

interface ProfileData {
  name: string;
  email: string;
  weight: number;
  height: number;
}

export const ProfilePage = () => {
  const { updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      const data = await getProfile();
      setProfileData(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async () => {
    if (!profileData) return;

    setIsLoading(true);
    try {
      const updatedProfile = await updateProfile(profileData);
      setProfileData(updatedProfile);
      updateUser({ 
        name: updatedProfile.name,
        email: updatedProfile.email,
        weight: updatedProfile.weight,
        height: updatedProfile.height
      });
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
    <Box sx={{ mb: 3 }} data-test-id="page--profile">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Profile</Typography>
      </Box>
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
                inputProps={{ 'data-test-id': 'input--profile--name' }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                value={profileData.email}
                onChange={handleChange('email')}
                disabled={!isEditing}
                inputProps={{ 'data-test-id': 'input--profile--email' }}
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
                inputProps={{ 'data-test-id': 'input--profile--weight' }}
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
                inputProps={{ 'data-test-id': 'input--profile--height' }}
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
                    data-test-id="button--profile--save"
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={async () => {
                      await fetchProfile();
                      setIsEditing(false);
                    }}
                    disabled={isLoading}
                    data-test-id="button--profile--cancel"
                  >
                    Cancel
                  </Button>
                </Box>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setIsEditing(true)}
                  data-test-id="button--profile--edit"
                >
                  Edit Profile
                </Button>
              )}
            </Grid>
          </Grid>
        )}
      </Paper>

      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        Change Password
      </Typography>
      <Paper sx={{ p: 3 }}>
        <ChangePasswordForm />
      </Paper>
    </Box>
  );
};
