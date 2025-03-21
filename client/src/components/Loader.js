import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const Loader = ({ message = 'Loading...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100%',
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <CircularProgress 
          size={60} 
          thickness={4} 
          color="primary" 
          sx={{ mb: 2 }} 
        />
      </motion.div>
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Typography variant="h6" color="textSecondary">
          {message}
        </Typography>
      </motion.div>
    </Box>
  );
};

export default Loader; 