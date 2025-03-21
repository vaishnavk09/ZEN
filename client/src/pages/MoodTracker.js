import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  TextField, 
  Grid, 
  CircularProgress,
  Paper,
  IconButton,
  Tooltip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Save as SaveIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  Info as InfoIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, subDays, isToday, isYesterday } from 'date-fns';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

const MoodTracker = () => {
  const { darkMode } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [moodEntries, setMoodEntries] = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);
  const [notes, setNotes] = useState('');
  const [timeframe, setTimeframe] = useState('week');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  
  // Mood options
  const moodOptions = [
    { value: 1, emoji: '😢', label: 'Very Bad' },
    { value: 2, emoji: '😔', label: 'Bad' },
    { value: 3, emoji: '😐', label: 'Neutral' },
    { value: 4, emoji: '🙂', label: 'Good' },
    { value: 5, emoji: '😄', label: 'Very Good' },
    { value: 6, emoji: '😊', label: 'Great' },
    { value: 7, emoji: '🥰', label: 'Excellent' },
    { value: 8, emoji: '😍', label: 'Amazing' },
    { value: 9, emoji: '🤩', label: 'Outstanding' },
    { value: 10, emoji: '🥳', label: 'Perfect' }
  ];
  
  // Fetch mood entries on component mount
  useEffect(() => {
    fetchMoodEntries();
  }, []);
  
  // Fetch mood entries from API
  const fetchMoodEntries = async () => {
    try {
      setLoading(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No auth token found');
        return;
      }
      
      const response = await axios.get('http://localhost:5000/api/moods', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Sort entries by date (newest first)
      const sortedEntries = response.data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      
      setMoodEntries(sortedEntries);
      
    } catch (error) {
      console.error('Error fetching mood entries:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Save mood entry
  const saveMoodEntry = async () => {
    if (!selectedMood) {
      return;
    }
    
    try {
      setSaving(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No auth token found');
        return;
      }
      
      const moodData = {
        value: selectedMood,
        notes: notes.trim() || null
      };
      
      await axios.post('http://localhost:5000/api/moods', moodData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh mood entries
      await fetchMoodEntries();
      
      // Reset form
      setSelectedMood(null);
      setNotes('');
      
    } catch (error) {
      console.error('Error saving mood entry:', error);
    } finally {
      setSaving(false);
    }
  };
  
  // Delete mood entry
  const deleteMoodEntry = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No auth token found');
        return;
      }
      
      await axios.delete(`http://localhost:5000/api/moods/${entryToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove deleted entry from state
      setMoodEntries(moodEntries.filter(entry => entry._id !== entryToDelete._id));
      setDeleteDialogOpen(false);
      setEntryToDelete(null);
      
    } catch (error) {
      console.error('Error deleting mood entry:', error);
    }
  };
  
  // Handle mood selection
  const handleMoodSelect = (value) => {
    setSelectedMood(value);
  };
  
  // Handle notes change
  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };
  
  // Handle timeframe change
  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = parseISO(dateString);
    
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };
  
  // Prepare chart data
  const prepareChartData = () => {
    let days;
    let label;
    
    switch (timeframe) {
      case 'week':
        days = 7;
        label = 'Last 7 Days';
        break;
      case 'month':
        days = 30;
        label = 'Last 30 Days';
        break;
      case 'year':
        days = 365;
        label = 'Last Year';
        break;
      default:
        days = 7;
        label = 'Last 7 Days';
    }
    
    // Generate dates for the selected timeframe
    const dates = Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - 1 - i);
      return format(date, 'MMM dd');
    });
    
    // Map mood values to dates
    const moodValues = dates.map(date => {
      const matchingMood = moodEntries.find(mood => 
        format(parseISO(mood.createdAt), 'MMM dd') === date
      );
      return matchingMood ? matchingMood.value : null;
    });
    
    return {
      labels: dates,
      datasets: [
        {
          label: 'Mood',
          data: moodValues,
          fill: true,
          backgroundColor: darkMode 
            ? 'rgba(138, 121, 240, 0.2)' 
            : 'rgba(106, 90, 205, 0.2)',
          borderColor: darkMode ? '#8a79f0' : '#6a5acd',
          tension: 0.4,
          pointBackgroundColor: darkMode ? '#8a79f0' : '#6a5acd',
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 1,
        max: 10,
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: darkMode ? '#333' : '#fff',
        titleColor: darkMode ? '#fff' : '#333',
        bodyColor: darkMode ? '#fff' : '#333',
        borderColor: darkMode ? '#555' : '#ddd',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          title: (tooltipItems) => {
            return tooltipItems[0].label;
          },
          label: (context) => {
            const value = context.parsed.y;
            if (value === null) return 'No data';
            return `Mood: ${value}/10 ${moodOptions.find(m => m.value === value)?.emoji || ''}`;
          }
        }
      }
    }
  };
  
  // Calculate average mood
  const calculateAverageMood = () => {
    if (moodEntries.length === 0) return 0;
    
    const sum = moodEntries.reduce((total, entry) => total + entry.value, 0);
    return Math.round((sum / moodEntries.length) * 10) / 10;
  };
  
  // Calculate mood trend
  const calculateMoodTrend = () => {
    if (moodEntries.length < 3) return 'Not enough data';
    
    const recentMoods = moodEntries.slice(0, 3).map(entry => entry.value);
    const avgRecent = recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length;
    
    const olderMoods = moodEntries.slice(3, 6).map(entry => entry.value);
    if (olderMoods.length === 0) return 'Not enough data';
    
    const avgOlder = olderMoods.reduce((a, b) => a + b, 0) / olderMoods.length;
    
    if (avgRecent - avgOlder > 0.5) return 'Improving';
    if (avgOlder - avgRecent > 0.5) return 'Declining';
    return 'Stable';
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
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
        <Typography variant="h4">Mood Tracker</Typography>
        <IconButton onClick={() => setInfoDialogOpen(true)}>
          <InfoIcon />
        </IconButton>
      </Box>
      
      {/* Mood Selection */}
      <Grid 
        container 
        spacing={3}
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                How are you feeling today?
              </Typography>
              
              <Box sx={{ my: 4 }}>
                <Grid container spacing={2} justifyContent="center">
                  {moodOptions.map((mood) => (
                    <Grid item key={mood.value}>
                      <Tooltip title={`${mood.label} (${mood.value}/10)`} arrow>
                        <Box
                          component={motion.div}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleMoodSelect(mood.value)}
                          sx={{
                            fontSize: '2.5rem',
                            cursor: 'pointer',
                            p: 1,
                            borderRadius: '50%',
                            bgcolor: selectedMood === mood.value 
                              ? (darkMode ? 'rgba(138, 121, 240, 0.3)' : 'rgba(106, 90, 205, 0.2)')
                              : 'transparent',
                            border: selectedMood === mood.value 
                              ? `2px solid ${darkMode ? '#8a79f0' : '#6a5acd'}`
                              : '2px solid transparent',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {mood.emoji}
                        </Box>
                      </Tooltip>
                    </Grid>
                  ))}
                </Grid>
              </Box>
              
              <TextField
                fullWidth
                label="Notes (Optional)"
                value={notes}
                onChange={handleNotesChange}
                variant="outlined"
                multiline
                rows={4}
                placeholder="What's contributing to your mood today? Any specific events or thoughts?"
                sx={{ mb: 3 }}
              />
              
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                startIcon={<SaveIcon />}
                onClick={saveMoodEntry}
                disabled={saving || !selectedMood}
                sx={{ borderRadius: 8, py: 1.5 }}
              >
                {saving ? 'Saving...' : 'Save Mood'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">Mood Overview</Typography>
                <Box>
                  <Button
                    size="small"
                    variant={timeframe === 'week' ? 'contained' : 'outlined'}
                    onClick={() => handleTimeframeChange('week')}
                    sx={{ mr: 1, borderRadius: 8 }}
                  >
                    Week
                  </Button>
                  <Button
                    size="small"
                    variant={timeframe === 'month' ? 'contained' : 'outlined'}
                    onClick={() => handleTimeframeChange('month')}
                    sx={{ mr: 1, borderRadius: 8 }}
                  >
                    Month
                  </Button>
                  <Button
                    size="small"
                    variant={timeframe === 'year' ? 'contained' : 'outlined'}
                    onClick={() => handleTimeframeChange('year')}
                    sx={{ borderRadius: 8 }}
                  >
                    Year
                  </Button>
                </Box>
              </Box>
              
              <Box sx={{ height: 300, mb: 3 }}>
                {moodEntries.length > 0 ? (
                  <Line data={prepareChartData()} options={chartOptions} />
                ) : (
                  <Box 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      justifyContent: 'center', 
                      alignItems: 'center',
                      bgcolor: 'background.default',
                      borderRadius: 2
                    }}
                  >
                    <Typography variant="body1" color="textSecondary" gutterBottom>
                      No mood data available yet
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Start tracking your mood to see patterns over time
                    </Typography>
                  </Box>
                )}
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: darkMode ? 'rgba(138, 121, 240, 0.1)' : 'rgba(106, 90, 205, 0.1)',
                      height: '100%'
                    }}
                  >
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Average Mood
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="h4" sx={{ mr: 1 }}>
                        {calculateAverageMood()}
                      </Typography>
                      <Typography variant="h5">
                        {moodOptions.find(m => Math.round(calculateAverageMood()) === m.value)?.emoji || '😐'}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={6}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: darkMode ? 'rgba(138, 121, 240, 0.1)' : 'rgba(106, 90, 205, 0.1)',
                      height: '100%'
                    }}
                  >
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Mood Trend
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingUpIcon 
                        sx={{ 
                          mr: 1,
                          transform: calculateMoodTrend() === 'Declining' 
                            ? 'rotate(180deg)' 
                            : calculateMoodTrend() === 'Stable' 
                              ? 'rotate(90deg)' 
                              : 'rotate(0deg)',
                          color: calculateMoodTrend() === 'Improving' 
                            ? 'success.main' 
                            : calculateMoodTrend() === 'Declining' 
                              ? 'error.main' 
                              : 'warning.main'
                        }} 
                      />
                      <Typography variant="body1">
                        {calculateMoodTrend()}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Recent Entries */}
      <Card 
        elevation={3} 
        sx={{ borderRadius: 3, overflow: 'hidden', mt: 3 }}
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Recent Entries
          </Typography>
          
          {moodEntries.length > 0 ? (
            <Grid container spacing={2}>
              {moodEntries.slice(0, 5).map((entry) => (
                <Grid item xs={12} key={entry._id}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: 'background.default',
                      position: 'relative'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Typography variant="h5" sx={{ mr: 2 }}>
                            {moodOptions.find(m => m.value === entry.value)?.emoji || '😐'}
                          </Typography>
                          <Typography variant="subtitle1">
                            {moodOptions.find(m => m.value === entry.value)?.label || 'Unknown'} ({entry.value}/10)
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 1 }}>
                          <CalendarIcon fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="body2">
                            {formatDate(entry.createdAt)} at {format(parseISO(entry.createdAt), 'h:mm a')}
                          </Typography>
                        </Box>
                        
                        {entry.notes && (
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {entry.notes}
                          </Typography>
                        )}
                      </Box>
                      
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => {
                          setEntryToDelete(entry);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box 
              sx={{ 
                py: 4, 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center',
                bgcolor: 'background.default',
                borderRadius: 2
              }}
            >
              <Typography variant="body1" color="textSecondary" gutterBottom>
                No mood entries yet
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Your recent mood entries will appear here
              </Typography>
            </Box>
          )}
          
          {moodEntries.length > 5 && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<HistoryIcon />}
                sx={{ borderRadius: 8 }}
              >
                View All Entries
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Mood Entry</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this mood entry? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={deleteMoodEntry} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
      
      {/* Info Dialog */}
      <Dialog
        open={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>About Mood Tracking</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Tracking your mood can help you:
          </Typography>
          
          <Typography variant="body2" paragraph>
            • Identify patterns in your emotional well-being
          </Typography>
          
          <Typography variant="body2" paragraph>
            • Recognize triggers that affect your mental health
          </Typography>
          
          <Typography variant="body2" paragraph>
            • Monitor the effectiveness of treatments or lifestyle changes
          </Typography>
          
          <Typography variant="body2" paragraph>
            • Provide valuable information to share with healthcare providers
          </Typography>
          
          <Typography variant="body2" paragraph>
            • Increase self-awareness and emotional intelligence
          </Typography>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body1" paragraph>
            Tips for effective mood tracking:
          </Typography>
          
          <Typography variant="body2" paragraph>
            • Track your mood at consistent times each day
          </Typography>
          
          <Typography variant="body2" paragraph>
            • Include notes about factors that might be influencing your mood
          </Typography>
          
          <Typography variant="body2" paragraph>
            • Be honest with yourself about how you're feeling
          </Typography>
          
          <Typography variant="body2">
            • Look for patterns over time rather than focusing on individual entries
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInfoDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MoodTracker; 