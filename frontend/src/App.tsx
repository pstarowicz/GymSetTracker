import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AuthProvider } from '@/context/AuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { WorkoutsPage } from '@/pages/dashboard/WorkoutsPage';

import { ExercisesPage } from '@/pages/dashboard/ExercisesPage';
import { PersonalRecordsPage } from '@/pages/dashboard/PersonalRecordsPage';
import { ProfilePage } from '@/pages/dashboard/ProfilePage';
import { theme } from '@/styles/theme';

// Create a react-query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CssBaseline />
          <AuthProvider>
            <Router>
              <div data-test-id="app-root">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    <AuthGuard>
                      <DashboardLayout>
                        <Navigate to="/workouts" replace />
                      </DashboardLayout>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <AuthGuard>
                      <DashboardLayout>
                        <Navigate to="/workouts" replace />
                      </DashboardLayout>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/exercises"
                  element={
                    <AuthGuard>
                      <DashboardLayout>
                        <ExercisesPage />
                      </DashboardLayout>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/workouts"
                  element={
                    <AuthGuard>
                      <DashboardLayout>
                        <WorkoutsPage />
                      </DashboardLayout>
                    </AuthGuard>
                  }
                />

                <Route
                  path="/exercises"
                  element={
                    <AuthGuard>
                      <DashboardLayout>
                        <ExercisesPage />
                      </DashboardLayout>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/records"
                  element={
                    <AuthGuard>
                      <DashboardLayout>
                        <PersonalRecordsPage />
                      </DashboardLayout>
                    </AuthGuard>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <AuthGuard>
                      <DashboardLayout>
                        <ProfilePage />
                      </DashboardLayout>
                    </AuthGuard>
                  }
                />

                {/* Redirect root to dashboard or login */}
                <Route
                  path="/"
                  element={<Navigate to="/workouts" replace />}
                />

                {/* Catch all route */}
                <Route
                  path="*"
                  element={<Navigate to="/dashboard" replace />}
                />
              </Routes>
              </div>
            </Router>
          </AuthProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
