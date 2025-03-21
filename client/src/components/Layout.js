import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  IconButton, 
  Typography, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Avatar, 
  Menu, 
  MenuItem, 
  Tooltip, 
  useMediaQuery, 
  useTheme as useMuiTheme,
  Switch,
  FormControlLabel
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Dashboard as DashboardIcon, 
  Book as JournalIcon, 
  Mood as MoodIcon, 
  Chat as ChatIcon, 
  AirOutlined as BreathingIcon, 
  Logout as LogoutIcon, 
  Brightness4 as DarkModeIcon, 
  Brightness7 as LightModeIcon,
  Person as PersonIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  }),
);

const AppBarStyled = styled(AppBar, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: `${drawerWidth}px`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
  }),
);

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const Layout = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  
  const [open, setOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState(null);
  
  const handleDrawerToggle = () => {
    setOpen(!open);
  };
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Journal', icon: <JournalIcon />, path: '/journal' },
    { text: 'Mood Tracker', icon: <MoodIcon />, path: '/mood-tracker' },
    { text: 'Chatbot', icon: <ChatIcon />, path: '/chatbot' },
    { text: 'Breathing Exercise', icon: <BreathingIcon />, path: '/breathing-exercise' },
  ];
  
  // Get page title based on current path
  const getPageTitle = () => {
    const currentItem = menuItems.find(item => item.path === location.pathname);
    return currentItem ? currentItem.text : 'MindfulMe';
  };
  
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBarStyled position="fixed" open={open} elevation={0}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {getPageTitle()}
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={toggleTheme}
                icon={<LightModeIcon />}
                checkedIcon={<DarkModeIcon />}
                color="default"
              />
            }
            label=""
          />
          
          <Box>
            <Tooltip title="Account settings">
              <IconButton onClick={handleMenu} color="inherit">
                <Avatar 
                  alt={user?.name} 
                  src="/static/images/avatar/1.jpg" 
                  sx={{ 
                    width: 32, 
                    height: 32,
                    bgcolor: 'primary.main'
                  }}
                >
                  {user?.name?.charAt(0)}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Profile</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleClose}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Settings</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBarStyled>
      
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant={isMobile ? "temporary" : "persistent"}
        anchor="left"
        open={open}
        onClose={isMobile ? handleDrawerToggle : undefined}
      >
        <DrawerHeader sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          p: 2
        }}>
          <Typography variant="h5" component="div" color="primary" fontWeight="bold">
            MindfulMe
          </Typography>
        </DrawerHeader>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem 
              button 
              key={item.text} 
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: '0 20px 20px 0',
                mr: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.light',
                  '&:hover': {
                    bgcolor: 'primary.light',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ 
                color: location.pathname === item.path ? 'primary.main' : 'inherit'
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
        <Box sx={{ flexGrow: 1 }} />
        <Divider />
        <List>
          <ListItem button onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>
      
      <Main open={open}>
        <DrawerHeader />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </Main>
    </Box>
  );
};

export default Layout; 