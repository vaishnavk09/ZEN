import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper
} from '@mui/material';
import { 
  SentimentDissatisfied as SadIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const NotFound = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  
  return (
    <Container maxWidth="md">
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
            width: '100%',
            textAlign: 'center'
          }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: 'spring',
              stiffness: 260,
              damping: 20,
              delay: 0.2 
            }}
          >
            <SadIcon 
              sx={{ 
                fontSize: 120, 
                color: darkMode ? 'rgba(138, 121, 240, 0.7)' : 'rgba(106, 90, 205, 0.7)',
                mb: 2
              }} 
            />
          </motion.div>
          
          <Typography 
            variant="h1" 
            component={motion.h1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            sx={{ 
              fontWeight: 700, 
              fontSize: { xs: '4rem', md: '6rem' },
              background: darkMode 
                ? 'linear-gradient(45deg, #6a5acd 30%, #8a79f0 90%)'
                : 'linear-gradient(45deg, #6a5acd 30%, #8a79f0 90%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            404
          </Typography>
          
          <Typography 
            variant="h4" 
            component={motion.h4}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            gutterBottom
          >
            Page Not Found
          </Typography>
          
          <Typography 
            variant="body1" 
            color="text.secondary"
            component={motion.p}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            sx={{ mb: 4, maxWidth: 500 }}
          >
            The page you're looking for doesn't exist or has been moved.
            Let's get you back to a place of mindfulness.
          </Typography>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
              sx={{ borderRadius: 8, px: 4, py: 1.5 }}
            >
              Back to Home
            </Button>
          </motion.div>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotFound; 