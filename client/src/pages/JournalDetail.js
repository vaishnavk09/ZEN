import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  IconButton, 
  Chip,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper
} from '@mui/material';
import { 
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
  Favorite as HeartIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Tag as TagIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const JournalDetail = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [entry, setEntry] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Fetch journal entry on component mount
  useEffect(() => {
    fetchJournalEntry();
  }, [id]);
  
  // Fetch journal entry from API
  const fetchJournalEntry = async () => {
    try {
      setLoading(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No auth token found');
        return;
      }
      
      const response = await axios.get(`http://localhost:5000/api/journals/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEntry(response.data);
      
    } catch (error) {
      console.error('Error fetching journal entry:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Delete journal entry
  const deleteEntry = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No auth token found');
        return;
      }
      
      await axios.delete(`http://localhost:5000/api/journals/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      navigate('/journal');
      
    } catch (error) {
      console.error('Error deleting journal entry:', error);
    }
  };
  
  // Get mood emoji based on value
  const getMoodEmoji = (value) => {
    if (!value) return null;
    if (value >= 8) return '😄';
    if (value >= 6) return '🙂';
    if (value >= 4) return '😐';
    if (value >= 2) return '😔';
    return '😢';
  };
  
  // Get mood label based on value
  const getMoodLabel = (value) => {
    if (!value) return null;
    if (value >= 8) return 'Great';
    if (value >= 6) return 'Good';
    if (value >= 4) return 'Neutral';
    if (value >= 2) return 'Not Good';
    return 'Bad';
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!entry) {
    return (
      <Box sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <IconButton onClick={() => navigate('/journal')} sx={{ mr: 2 }}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4">Journal Entry Not Found</Typography>
        </Box>
        
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            borderRadius: 3, 
            bgcolor: 'background.default',
            textAlign: 'center',
            maxWidth: 500,
            mx: 'auto'
          }}
        >
          <Typography variant="h6" gutterBottom>
            Entry Not Found
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            The journal entry you're looking for doesn't exist or has been deleted.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/journal')}
            sx={{ mt: 2, borderRadius: 8, px: 3 }}
          >
            Back to Journal
          </Button>
        </Paper>
      </Box>
    );
  }
  
  return (
    <Box sx={{ py: 3 }}>
      {/* Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4 
        }}
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate('/journal')} sx={{ mr: 2 }}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4">Journal Entry</Typography>
        </Box>
        <Box>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/journal/edit/${id}`)}
            sx={{ mr: 2, borderRadius: 8 }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialogOpen(true)}
            sx={{ borderRadius: 8 }}
          >
            Delete
          </Button>
        </Box>
      </Box>
      
      {/* Entry Content */}
      <Box 
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
          <CardContent sx={{ p: 4 }}>
            {/* Entry Header */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" gutterBottom>
                {entry.title || format(parseISO(entry.createdAt), 'MMMM d, yyyy')}
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, color: 'text.secondary' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {format(parseISO(entry.createdAt), 'MMMM d, yyyy')}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TimeIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    {format(parseISO(entry.createdAt), 'h:mm a')}
                  </Typography>
                </Box>
                
                {entry.mood && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <HeartIcon fontSize="small" sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      Feeling {getMoodLabel(entry.mood)} {getMoodEmoji(entry.mood)}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            {/* Entry Content */}
            <Typography 
              variant="body1" 
              sx={{ 
                whiteSpace: 'pre-wrap',
                lineHeight: 1.8
              }}
            >
              {entry.content}
            </Typography>
            
            {/* Tags */}
            {entry.tags && entry.tags.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {entry.tags.map((tag, index) => (
                    <Chip 
                      key={index} 
                      label={tag} 
                      size="small" 
                      icon={<TagIcon fontSize="small" />}
                      sx={{ 
                        bgcolor: darkMode ? 'rgba(138, 121, 240, 0.1)' : 'rgba(106, 90, 205, 0.1)',
                        color: darkMode ? '#8a79f0' : '#6a5acd'
                      }} 
                    />
                  ))}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
        
        {/* Mood Card */}
        {entry.mood && (
          <Card 
            elevation={3} 
            sx={{ 
              borderRadius: 3, 
              overflow: 'hidden',
              mb: 3,
              background: darkMode 
                ? 'linear-gradient(45deg, #6a5acd 30%, #8a79f0 90%)'
                : 'linear-gradient(45deg, #6a5acd 30%, #8a79f0 90%)',
              color: 'white'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Mood Rating
                  </Typography>
                  <Typography variant="body2">
                    You were feeling {getMoodLabel(entry.mood)} when you wrote this entry.
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h3" sx={{ mr: 2 }}>
                    {entry.mood}/10
                  </Typography>
                  <Typography variant="h3">
                    {getMoodEmoji(entry.mood)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}
        
        {/* Navigation Buttons */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            mt: 4
          }}
        >
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => navigate('/journal')}
            sx={{ borderRadius: 8 }}
          >
            Back to Journal
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/journal/edit/${id}`)}
            sx={{ borderRadius: 8 }}
          >
            Edit Entry
          </Button>
        </Box>
      </Box>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Journal Entry</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this journal entry? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={deleteEntry} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JournalDetail; 