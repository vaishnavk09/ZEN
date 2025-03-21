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
  CircularProgress,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  LockOutlined as LockIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Register = () => {
  const { register } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Personal Information', 'Account Security'];
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState('');
  
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
    
    // Clear register error when user types
    if (registerError) {
      setRegisterError('');
    }
  };
  
  // Toggle password visibility
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };
  
  // Toggle confirm password visibility
  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  // Validate step 1
  const validateStep1 = () => {
    const newErrors = {};
    
    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // Validate email
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Validate step 2
  const validateStep2 = () => {
    const newErrors = {};
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle next step
  const handleNext = () => {
    if (activeStep === 0) {
      if (validateStep1()) {
        setActiveStep(1);
      }
    }
  };
  
  // Handle back step
  const handleBack = () => {
    setActiveStep(0);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateStep2()) {
      return;
    }
    
    setIsSubmitting(true);
    setRegisterError('');
    
    try {
      await register(formData.name, formData.email, formData.password);
      navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
    } catch (error) {
      console.error('Registration error:', error);
      setRegisterError(
        error.response?.data?.message || 
        'Registration failed. Please try again.'
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
            <PersonIcon sx={{ color: 'white', fontSize: 32 }} />
          </Box>
          
          <Typography component="h1" variant="h5" gutterBottom>
            Create Your Account
          </Typography>
          
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Join MindfulMe and start your wellness journey
          </Typography>
          
          <Stepper activeStep={activeStep} sx={{ width: '100%', mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {registerError && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {registerError}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <AnimatePresence mode="wait">
              {activeStep === 0 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="name"
                    label="Full Name"
                    name="name"
                    autoComplete="name"
                    autoFocus
                    value={formData.name}
                    onChange={handleChange}
                    error={!!errors.name}
                    helperText={errors.name}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
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
                  
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleNext}
                    endIcon={<ArrowForwardIcon />}
                    sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 8 }}
                  >
                    Next
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="new-password"
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
                  
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={handleToggleConfirmPassword}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                  
                  <Box sx={{ display: 'flex', mt: 3, mb: 2 }}>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={handleBack}
                      startIcon={<ArrowBackIcon />}
                      sx={{ mr: 1, py: 1.5, borderRadius: 8, flex: 1 }}
                    >
                      Back
                    </Button>
                    
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={isSubmitting}
                      sx={{ py: 1.5, borderRadius: 8, flex: 2 }}
                    >
                      {isSubmitting ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
            
            <Grid container justifyContent="center" sx={{ mt: 2 }}>
              <Grid item>
                <Typography variant="body2" align="center">
                  Already have an account?{' '}
                  <Link component={RouterLink} to="/login" variant="body2" color="primary">
                    Sign in
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

export default Register; 