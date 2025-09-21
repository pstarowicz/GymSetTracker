import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Link,
  Alert,
  Grid,
} from '@mui/material';
import { RegisterRequest } from '@/types/auth';
import { FormInput } from '@/components/shared/FormInput';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/context/AuthContext';

export const RegisterPage = () => {
  const { control, handleSubmit, formState: { errors }, watch } = useForm<RegisterRequest>({
    defaultValues: {
      email: '',
      password: '',
      name: '',
      weight: undefined,
      height: undefined
    },
    mode: 'onBlur'
  });
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (data: RegisterRequest) => {
    try {
      setError('');
      const response = await authService.register(data);
      login(response);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ mt: 1, width: '100%' }}
          >
            <FormInput
              name="name"
              control={control}
              label="Full Name"
              autoComplete="name"
              autoFocus
              rules={{
                required: 'Full name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters'
                }
              }}
            />
            <FormInput
              name="email"
              control={control}
              label="Email Address"
              autoComplete="email"
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              }}
            />
            <FormInput
              name="password"
              control={control}
              label="Password"
              type="password"
              autoComplete="new-password"
              rules={{
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/,
                  message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
                }
              }}
            />

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <FormInput
                  name="weight"
                  control={control}
                  label="Weight (kg)"
                  type="number"
                  rules={{
                    min: {
                      value: 30,
                      message: 'Weight must be at least 30 kg'
                    },
                    max: {
                      value: 300,
                      message: 'Weight must be less than 300 kg'
                    }
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <FormInput
                  name="height"
                  control={control}
                  label="Height (cm)"
                  type="number"
                  rules={{
                    min: {
                      value: 100,
                      message: 'Height must be at least 100 cm'
                    },
                    max: {
                      value: 250,
                      message: 'Height must be less than 250 cm'
                    }
                  }}
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                {"Already have an account? Sign In"}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
