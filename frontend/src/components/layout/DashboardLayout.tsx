import { useState } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  FitnessCenter,
  Timeline,
  EmojiEvents,
  AccountCircle,
  ChevronLeft,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const drawerWidth = 280;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme }) => ({
  flexGrow: 1,
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  '& > div': {
    width: '100%',
    maxWidth: '1200px',
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  }
}));

const menuItems = [
  { text: 'Workouts', icon: <FitnessCenter />, path: '/workouts' },
  { text: 'Exercises', icon: <Timeline />, path: '/exercises' },
  { text: 'Personal Records', icon: <EmojiEvents />, path: '/records' },
  { text: 'Profile', icon: <AccountCircle />, path: '/profile' },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: '100%',
          height: 70,
          display: 'flex',
          justifyContent: 'center',
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ width: '100%', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              {open ? <ChevronLeft /> : <MenuIcon />}
            </IconButton>
            <Typography 
              variant="h6"
              noWrap 
              component="div" 
              sx={{ 
                fontWeight: 600,
                background: 'linear-gradient(45deg, #2563eb 30%, #4f46e5 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              GymSetTracker
            </Typography>
          </Box>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              backgroundColor: 'rgba(37, 99, 235, 0.08)',
              borderRadius: 2,
              padding: '6px 12px',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/profile')}
          >
            <AccountCircle sx={{ color: 'primary.main' }} />
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {user?.name || 'Profile'}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          position: 'fixed',
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            padding: theme.spacing(2),
            paddingTop: 0,
            border: 'none',
            backgroundColor: theme.palette.background.default,
          },
        }}
        variant={isMobile ? 'temporary' : 'persistent'}
        anchor="left"
        open={open}
        onClose={handleDrawerToggle}
      >
        <Toolbar sx={{ height: 70 }} />
        <Box sx={{ mb: 2 }}>
          <Typography variant="overline" color="text.secondary" sx={{ px: 2 }}>
            MENU
          </Typography>
        </Box>
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
                sx={{
                  py: 1.5,
                  px: 2,
                }}
              >
                <ListItemIcon sx={{ 
                  color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                  minWidth: 40,
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: location.pathname === item.path ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
          <Box sx={{ mt: 2 }}>
            <Divider />
          </Box>
          <ListItem disablePadding sx={{ mt: 2 }}>
            <ListItemButton 
              onClick={logout}
              sx={{
                py: 1.5,
                px: 2,
                color: 'error.main',
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                <AccountCircle />
              </ListItemIcon>
              <ListItemText 
                primary="Logout" 
                primaryTypographyProps={{
                  fontWeight: 500,
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      <Main open={open}>
        <Toolbar /> {/* This creates space under the AppBar */}
        {children}
      </Main>
    </Box>
  );
};
