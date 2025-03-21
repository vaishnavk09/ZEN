import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  Chip,
  Slider,
  IconButton,
  InputAdornment,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Save as SaveIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
  Add as AddIcon,
  Favorite as HeartIcon,
  LocalOffer as TagIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { useTheme } from '../context/ThemeContext';

const JournalForm = ({ isEditing = false }) => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState(5);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [formChanged, setFormChanged] = useState(false);
  
  // Fetch journal entry if editing
  useEffect(() => {
    if (isEditing && id) {
      fetchJournalEntry();
    }
  }, [isEditing, id]);
  
  // Track form changes
  useEffect(() => {
    if (!loading) {
      setFormChanged(true);
    }
  }, [title, content, mood, tags]);
  
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
      
      const entry = response.data;
      
      setTitle(entry.title || '');
      setContent(entry.content || '');
      setMood(entry.mood || 5);
      setTags(entry.tags || []);
      
    } catch (error) {
      console.error('Error fetching journal entry:', error);
    } finally {
      setLoading(false);
      setFormChanged(false);
    }
  };
  
  // Save journal entry
  const saveJournalEntry = async () => {
    try {
      setSaving(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No auth token found');
        return;
      }
      
      const entryData = {
        title: title.trim() || null,
        content,
        mood,
        tags
      };
      
      let response;
      
      if (isEditing) {
        response = await axios.put(`http://localhost:5000/api/journals/${id}`, entryData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        response = await axios.post('http://localhost:5000/api/journals', entryData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      navigate('/journal');
      
    } catch (error) {
      console.error('Error saving journal entry:', error);
    } finally {
      setSaving(false);
    }
  };
  
  // Handle tag input change
  const handleTagInputChange = (e) => {
    setNewTag(e.target.value);
  };
  
  // Add tag
  const addTag = () => {
    const trimmedTag = newTag.trim();
    
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setNewTag('');
    }
    
    setTagDialogOpen(false);
  };
  
  // Remove tag
  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // Handle back button click
  const handleBackClick = () => {
    if (formChanged) {
      setDiscardDialogOpen(true);
    } else {
      navigate('/journal');
    }
  };
  
  // Get mood emoji based on value
  const getMoodEmoji = (value) => {
    if (value >= 8) return '😄';
    if (value >= 6) return '🙂';
    if (value >= 4) return '😐';
    if (value >= 2) return '😔';
    return '😢';
  };
  
  // Get mood label based on value
  const getMoodLabel = (value) => {
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
          <IconButton 
            onClick={handleBackClick}
            sx={{ mr: 2 }}
          >
            <BackIcon />
          </IconButton>
          <Typography variant="h4">
            {isEditing ? 'Edit Journal Entry' : 'New Journal Entry'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={saveJournalEntry}
          disabled={saving || !content.trim()}
          sx={{ borderRadius: 8, px: 3 }}
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </Box>
      
      {/* Form */}
      <Grid 
        container 
        spacing={3}
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Grid item xs={12} md={8}>
          <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <CardContent sx={{ p: 3 }}>
              <TextField
                fullWidth
                label="Title (Optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                variant="outlined"
                placeholder="Give your entry a title..."
                sx={{ mb: 3 }}
              />
              
              <TextField
                fullWidth
                label="Journal Entry"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                variant="outlined"
                multiline
                rows={12}
                placeholder="Write your thoughts, feelings, and experiences here..."
                sx={{ mb: 3 }}
              />
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => removeTag(tag)}
                    color="primary"
                    size="small"
                    icon={<TagIcon fontSize="small" />}
                  />
                ))}
                <Chip
                  icon={<AddIcon />}
                  label="Add Tag"
                  onClick={() => setTagDialogOpen(true)}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                How are you feeling today?
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Typography variant="h2" sx={{ display: 'flex', alignItems: 'center' }}>
                  {getMoodEmoji(mood)}
                </Typography>
              </Box>
              
              <Box sx={{ px: 2 }}>
                <Slider
                  value={mood}
                  onChange={(e, newValue) => setMood(newValue)}
                  min={1}
                  max={10}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}/10`}
                  sx={{
                    '& .MuiSlider-markLabel': {
                      fontSize: '0.75rem'
                    }
                  }}
                />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body2" color="textSecondary">Not Good</Typography>
                  <Typography variant="body2" color="textSecondary">Great</Typography>
                </Box>
              </Box>
              
              <Box 
                sx={{ 
                  mt: 3, 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: darkMode ? 'rgba(138, 121, 240, 0.1)' : 'rgba(106, 90, 205, 0.1)',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <HeartIcon sx={{ mr: 2, color: darkMode ? '#8a79f0' : '#6a5acd' }} />
                <Typography>
                  You're feeling <strong>{getMoodLabel(mood)}</strong> today
                </Typography>
              </Box>
            </CardContent>
          </Card>
          
          <Card elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Journal Tips
              </Typography>
              
              <Typography variant="body2" paragraph>
                • Write freely without worrying about grammar or spelling
              </Typography>
              
              <Typography variant="body2" paragraph>
                • Reflect on both positive and challenging experiences
              </Typography>
              
              <Typography variant="body2" paragraph>
                • Consider what you're grateful for today
              </Typography>
              
              <Typography variant="body2">
                • Use tags to organize your entries and track patterns
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Add Tag Dialog */}
      <Dialog
        open={tagDialogOpen}
        onClose={() => setTagDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Add Tag</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tag Name"
            fullWidth
            value={newTag}
            onChange={handleTagInputChange}
            variant="outlined"
            placeholder="e.g., anxiety, gratitude, work"
            InputProps={{
              endAdornment: newTag && (
                <InputAdornment position="end">
                  <IconButton onClick={() => setNewTag('')} edge="end">
                    <CloseIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addTag();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTagDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={addTag} 
            color="primary"
            disabled={!newTag.trim()}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Discard Changes Dialog */}
      <Dialog
        open={discardDialogOpen}
        onClose={() => setDiscardDialogOpen(false)}
      >
        <DialogTitle>Discard Changes?</DialogTitle>
        <DialogContent>
          <Typography>
            You have unsaved changes. Are you sure you want to leave this page? Your changes will be lost.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDiscardDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => navigate('/journal')} 
            color="error"
          >
            Discard
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JournalForm; 