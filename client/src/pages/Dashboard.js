import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  CircularProgress,
  IconButton,
  Chip,
  Avatar,
  Paper
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon,
  Edit as EditIcon,
  CalendarToday as CalendarIcon,
  Favorite as HeartIcon,
  SelfImprovement as MeditationIcon,
  Chat as ChatIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import { format, parseISO, subDays } from 'date-fns';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
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
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [moodData, setMoodData] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [stats, setStats] = useState({
    averageMood: 0,
    journalStreak: 0,
    totalEntries: 0,
    moodTrend: 'stable'
  });
  
  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('No auth token found');
          return;
        }
        
        // Fetch mood data
        const moodResponse = await axios.get('http://localhost:5000/api/moods', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch journal entries
        const journalResponse = await axios.get('http://localhost:5000/api/journals', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setMoodData(moodResponse.data);
        setJournalEntries(journalResponse.data);
        
        // Calculate stats
        calculateStats(moodResponse.data, journalResponse.data);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  // Calculate user stats from mood and journal data
  const calculateStats = (moods, journals) => {
    // Calculate average mood
    const moodValues = moods.map(mood => mood.value);
    const averageMood = moodValues.length > 0 
      ? Math.round((moodValues.reduce((a, b) => a + b, 0) / moodValues.length) * 10) / 10
      : 0;
    
    // Calculate journal streak
    let streak = 0;
    const sortedJournals = [...journals].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    if (sortedJournals.length > 0) {
      streak = 1;
      for (let i = 0; i < sortedJournals.length - 1; i++) {
        const currentDate = new Date(sortedJournals[i].createdAt).setHours(0, 0, 0, 0);
        const prevDate = new Date(sortedJournals[i + 1].createdAt).setHours(0, 0, 0, 0);
        const diffDays = Math.round((currentDate - prevDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          streak++;
        } else {
          break;
        }
      }
    }
    
    // Calculate mood trend
    let moodTrend = 'stable';
    if (moodValues.length >= 3) {
      const recentMoods = moodValues.slice(0, 3);
      const avgRecent = recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length;
      const olderMoods = moodValues.slice(3, 6);
      
      if (olderMoods.length > 0) {
        const avgOlder = olderMoods.reduce((a, b) => a + b, 0) / olderMoods.length;
        if (avgRecent - avgOlder > 0.5) moodTrend = 'improving';
        else if (avgOlder - avgRecent > 0.5) moodTrend = 'declining';
      }
    }
    
    setStats({
      averageMood,
      journalStreak: streak,
      totalEntries: journals.length,
      moodTrend
    });
  };
  
  // Prepare chart data
  const prepareChartData = () => {
    // Get last 7 days
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return format(date, 'MMM dd');
    });
    
    // Map mood values to dates
    const moodValues = dates.map(date => {
      const matchingMood = moodData.find(mood => 
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
            return `Mood: ${value}/10`;
          }
        }
      }
    }
  };
  
  // Get mood emoji based on value
  const getMoodEmoji = (value) => {
    if (!value) return '😐';
    if (value >= 8) return '😄';
    if (value >= 6) return '🙂';
    if (value >= 4) return '😐';
    if (value >= 2) return '😔';
    return '😢';
  };
  
  // Get mood trend icon and color
  const getMoodTrendInfo = () => {
    switch (stats.moodTrend) {
      case 'improving':
        return { icon: <TrendingUpIcon />, color: '#4caf50', text: 'Improving' };
      case 'declining':
        return { icon: <TrendingUpIcon sx={{ transform: 'rotate(180deg)' }} />, color: '#f44336', text: 'Declining' };
      default:
        return { icon: <TrendingUpIcon sx={{ transform: 'rotate(90deg)' }} />, color: '#ff9800', text: 'Stable' };
    }
  };
  
  // Truncate text
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
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
      {/* Welcome Section */}
      <Box 
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{ mb: 4 }}
      >
        <Typography variant="h4" gutterBottom>
          Welcome back, {currentUser?.name || 'Friend'}!
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Here's an overview of your mental wellness journey
        </Typography>
      </Box>
      
      {/* Stats Cards */}
      <Grid 
        container 
        spacing={3} 
        sx={{ mb: 4 }}
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={3} 
            sx={{ 
              borderRadius: 3,
              height: '100%',
              background: darkMode 
                ? 'linear-gradient(45deg, #6a5acd 30%, #8a79f0 90%)'
                : 'linear-gradient(45deg, #6a5acd 30%, #8a79f0 90%)',
              color: 'white'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', mr: 2 }}>
                  <HeartIcon />
                </Avatar>
                <Typography variant="h6">Average Mood</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                <Typography variant="h3" sx={{ mr: 1 }}>
                  {stats.averageMood}
                </Typography>
                <Typography variant="h4">
                  {getMoodEmoji(stats.averageMood)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                {getMoodTrendInfo().icon}
                <Typography variant="body2" sx={{ ml: 1 }}>
                  {getMoodTrendInfo().text}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(106, 90, 205, 0.1)', mr: 2, color: '#6a5acd' }}>
                  <EditIcon />
                </Avatar>
                <Typography variant="h6">Journal Streak</Typography>
              </Box>
              <Typography variant="h3" sx={{ mb: 1 }}>
                {stats.journalStreak}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {stats.journalStreak > 0 
                  ? `You've journaled ${stats.journalStreak} day${stats.journalStreak > 1 ? 's' : ''} in a row!` 
                  : 'Start journaling today!'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(106, 90, 205, 0.1)', mr: 2, color: '#6a5acd' }}>
                  <CalendarIcon />
                </Avatar>
                <Typography variant="h6">Total Entries</Typography>
              </Box>
              <Typography variant="h3" sx={{ mb: 1 }}>
                {stats.totalEntries}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {stats.totalEntries > 0 
                  ? `Great job tracking your journey!` 
                  : 'Start your wellness journey today!'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={3} 
            sx={{ 
              borderRadius: 3, 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: 3,
              background: 'rgba(106, 90, 205, 0.05)'
            }}
          >
            <Typography variant="h6" gutterBottom>
              How are you feeling?
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              size="large"
              onClick={() => navigate('/mood')}
              sx={{ 
                borderRadius: 8,
                px: 3,
                py: 1.5,
                mt: 2
              }}
            >
              Track Mood
            </Button>
          </Card>
        </Grid>
      </Grid>
      
      {/* Mood Chart */}
      <Grid 
        container 
        spacing={3}
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Grid item xs={12} md={8}>
          <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Mood Tracking</Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => navigate('/mood')}
                  endIcon={<ArrowForwardIcon />}
                >
                  View All
                </Button>
              </Box>
              
              {moodData.length > 0 ? (
                <Box sx={{ height: 300 }}>
                  <Line data={prepareChartData()} options={chartOptions} />
                </Box>
              ) : (
                <Box 
                  sx={{ 
                    height: 300, 
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
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => navigate('/mood')}
                    sx={{ mt: 2 }}
                  >
                    Start Tracking
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Recent Journal Entries</Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => navigate('/journal')}
                  endIcon={<ArrowForwardIcon />}
                >
                  View All
                </Button>
              </Box>
              
              {journalEntries.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {journalEntries.slice(0, 3).map((entry) => (
                    <React.Fragment key={entry._id}>
                      <ListItem 
                        alignItems="flex-start" 
                        component={motion.li}
                        whileHover={{ x: 5 }}
                        onClick={() => navigate(`/journal/${entry._id}`)}
                        sx={{ px: 0, py: 2, cursor: 'pointer' }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                {entry.title || format(parseISO(entry.createdAt), 'MMMM d, yyyy')}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {format(parseISO(entry.createdAt), 'MMM d')}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography
                                variant="body2"
                                color="textSecondary"
                                sx={{ mt: 1, mb: 1 }}
                              >
                                {truncateText(entry.content)}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                {entry.tags && entry.tags.slice(0, 2).map((tag, index) => (
                                  <Chip 
                                    key={index} 
                                    label={tag} 
                                    size="small" 
                                    sx={{ 
                                      bgcolor: darkMode ? 'rgba(138, 121, 240, 0.1)' : 'rgba(106, 90, 205, 0.1)',
                                      color: darkMode ? '#8a79f0' : '#6a5acd'
                                    }} 
                                  />
                                ))}
                                {entry.tags && entry.tags.length > 2 && (
                                  <Chip 
                                    label={`+${entry.tags.length - 2}`} 
                                    size="small" 
                                    sx={{ 
                                      bgcolor: 'transparent',
                                      border: '1px solid',
                                      borderColor: darkMode ? 'rgba(138, 121, 240, 0.3)' : 'rgba(106, 90, 205, 0.3)',
                                      color: darkMode ? '#8a79f0' : '#6a5acd'
                                    }} 
                                  />
                                )}
                              </Box>
                            </>
                          }
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box 
                  sx={{ 
                    height: 200, 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center', 
                    alignItems: 'center',
                    bgcolor: 'background.default',
                    borderRadius: 2
                  }}
                >
                  <Typography variant="body1" color="textSecondary" gutterBottom>
                    No journal entries yet
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => navigate('/journal/new')}
                    sx={{ mt: 2 }}
                  >
                    Write First Entry
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Quick Access */}
      <Grid 
        container 
        spacing={3}
        sx={{ mt: 2 }}
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Quick Access
          </Typography>
        </Grid>
        
        <Grid item xs={6} sm={4} md={3}>
          <Paper 
            elevation={2}
            component={motion.div}
            whileHover={{ y: -5, boxShadow: '0px 10px 20px rgba(0,0,0,0.1)' }}
            sx={{ 
              p: 3, 
              borderRadius: 3, 
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
            onClick={() => navigate('/journal/new')}
          >
            <Avatar 
              sx={{ 
                bgcolor: 'rgba(106, 90, 205, 0.1)', 
                color: '#6a5acd',
                width: 60,
                height: 60,
                mb: 2
              }}
            >
              <EditIcon fontSize="large" />
            </Avatar>
            <Typography variant="subtitle1" gutterBottom>
              New Journal Entry
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Record your thoughts and feelings
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={6} sm={4} md={3}>
          <Paper 
            elevation={2}
            component={motion.div}
            whileHover={{ y: -5, boxShadow: '0px 10px 20px rgba(0,0,0,0.1)' }}
            sx={{ 
              p: 3, 
              borderRadius: 3, 
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
            onClick={() => navigate('/breathing')}
          >
            <Avatar 
              sx={{ 
                bgcolor: 'rgba(106, 90, 205, 0.1)', 
                color: '#6a5acd',
                width: 60,
                height: 60,
                mb: 2
              }}
            >
              <MeditationIcon fontSize="large" />
            </Avatar>
            <Typography variant="subtitle1" gutterBottom>
              Breathing Exercise
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Reduce stress and anxiety
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={6} sm={4} md={3}>
          <Paper 
            elevation={2}
            component={motion.div}
            whileHover={{ y: -5, boxShadow: '0px 10px 20px rgba(0,0,0,0.1)' }}
            sx={{ 
              p: 3, 
              borderRadius: 3, 
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
            onClick={() => navigate('/chatbot')}
          >
            <Avatar 
              sx={{ 
                bgcolor: 'rgba(106, 90, 205, 0.1)', 
                color: '#6a5acd',
                width: 60,
                height: 60,
                mb: 2
              }}
            >
              <ChatIcon fontSize="large" />
            </Avatar>
            <Typography variant="subtitle1" gutterBottom>
              Mental Health Chatbot
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Get support and guidance
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={6} sm={4} md={3}>
          <Paper 
            elevation={2}
            component={motion.div}
            whileHover={{ y: -5, boxShadow: '0px 10px 20px rgba(0,0,0,0.1)' }}
            sx={{ 
              p: 3, 
              borderRadius: 3, 
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
            onClick={() => navigate('/mood')}
          >
            <Avatar 
              sx={{ 
                bgcolor: 'rgba(106, 90, 205, 0.1)', 
                color: '#6a5acd',
                width: 60,
                height: 60,
                mb: 2
              }}
            >
              <HeartIcon fontSize="large" />
            </Avatar>
            <Typography variant="subtitle1" gutterBottom>
              Mood Tracker
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Monitor your emotional wellbeing
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 