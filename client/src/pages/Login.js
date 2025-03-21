import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Container, 
  Grid, 
  Link, 
  InputAdornment, 
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  LockOutlined as LockIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Login = () => {
  const { login } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || '/';
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
    
    // Clear login error when user types
    if (loginError) {
      setLoginError('');
    }
  };
  
  // Toggle password visibility
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setLoginError('');
    
    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(
        error.response?.data?.message || 
        'Login failed. Please check your credentials and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4
        }}
      >
        <Paper
          component={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 3,
            width: '100%'
          }}
        >
          <Box
            component={motion.div}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            sx={{
              width: 70,
              height: 70,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2
            }}
          >
            <LockIcon sx={{ color: 'white', fontSize: 32 }} />
          </Box>
          
          <Typography component="h1" variant="h5" gutterBottom>
            Sign in to MindfulMe
          </Typography>
          
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Your personal mental wellness companion
          </Typography>
          
          {loginError && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {loginError}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 8 }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Sign In'
              )}
            </Button>
            
            <Grid container justifyContent="center" sx={{ mt: 2 }}>
              <Grid item>
                <Typography variant="body2" align="center">
                  Don't have an account?{' '}
                  <Link component={RouterLink} to="/register" variant="body2" color="primary">
                    Sign up
                  </Link>
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button 
            variant="text" 
            color="inherit" 
            size="small" 
            onClick={toggleTheme}
            sx={{ textTransform: 'none' }}
          >
            Switch to {darkMode ? 'Light' : 'Dark'} Mode
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login; 