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
} from '@mui/material';
import { LoginRequest } from '@/types/auth';
import { FormInput } from '@/components/shared/FormInput';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/context/AuthContext';

export const LoginPage = () => {
  const { control, handleSubmit, formState: { errors } } = useForm<LoginRequest>({
    defaultValues: {
      email: '',
      password: ''
    },
    mode: 'onBlur'
  });
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (data: LoginRequest) => {
    try {
      setError('');
      const response = await authService.login(data);
      login(response);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
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
            Sign in
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
              name="email"
              control={control}
              label="Email Address"
              autoComplete="email"
              autoFocus
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
              autoComplete="current-password"
              rules={{
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/register" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
