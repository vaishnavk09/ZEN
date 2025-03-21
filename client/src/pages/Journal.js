import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  TextField, 
  IconButton, 
  Chip,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Fab,
  Menu,
  MenuItem,
  Tooltip,
  Paper
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  MoreVert as MoreIcon,
  Favorite as HeartIcon,
  CalendarToday as CalendarIcon,
  Tag as TagIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const Journal = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [journalEntries, setJournalEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [sortOption, setSortOption] = useState('newest');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  
  // Menu states
  const [filterMenuAnchor, setFilterMenuAnchor] = useState(null);
  const [sortMenuAnchor, setSortMenuAnchor] = useState(null);
  const [entryMenuAnchor, setEntryMenuAnchor] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  
  // Fetch journal entries on component mount
  useEffect(() => {
    fetchJournalEntries();
  }, []);
  
  // Filter entries when search term, tags, or sort option changes
  useEffect(() => {
    filterEntries();
  }, [searchTerm, selectedTags, sortOption, journalEntries]);
  
  // Fetch journal entries from API
  const fetchJournalEntries = async () => {
    try {
      setLoading(true);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No auth token found');
        return;
      }
      
      const response = await axios.get('http://localhost:5000/api/journals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setJournalEntries(response.data);
      
      // Extract all unique tags
      const tags = new Set();
      response.data.forEach(entry => {
        if (entry.tags && entry.tags.length > 0) {
          entry.tags.forEach(tag => tags.add(tag));
        }
      });
      
      setAllTags(Array.from(tags));
      
    } catch (error) {
      console.error('Error fetching journal entries:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Filter and sort entries
  const filterEntries = () => {
    let filtered = [...journalEntries];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(entry => 
        (entry.title && entry.title.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (entry.content && entry.content.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(entry => 
        entry.tags && selectedTags.every(tag => entry.tags.includes(tag))
      );
    }
    
    // Sort entries
    switch (sortOption) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'title':
        filtered.sort((a, b) => {
          const titleA = a.title || '';
          const titleB = b.title || '';
          return titleA.localeCompare(titleB);
        });
        break;
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    
    setFilteredEntries(filtered);
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Toggle tag selection
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
    setSortOption('newest');
    setFilterMenuAnchor(null);
  };
  
  // Handle sort option change
  const handleSortChange = (option) => {
    setSortOption(option);
    setSortMenuAnchor(null);
  };
  
  // Open entry menu
  const handleEntryMenuOpen = (event, entry) => {
    event.stopPropagation();
    setEntryMenuAnchor(event.currentTarget);
    setSelectedEntry(entry);
  };
  
  // Close entry menu
  const handleEntryMenuClose = () => {
    setEntryMenuAnchor(null);
    setSelectedEntry(null);
  };
  
  // Open delete confirmation dialog
  const handleDeleteClick = () => {
    setEntryToDelete(selectedEntry);
    setDeleteDialogOpen(true);
    handleEntryMenuClose();
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
      
      await axios.delete(`http://localhost:5000/api/journals/${entryToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove deleted entry from state
      setJournalEntries(journalEntries.filter(entry => entry._id !== entryToDelete._id));
      setDeleteDialogOpen(false);
      setEntryToDelete(null);
      
    } catch (error) {
      console.error('Error deleting journal entry:', error);
    }
  };
  
  // Truncate text
  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
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
        <Typography variant="h4">Journal</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/journal/new')}
          sx={{ borderRadius: 8, px: 3 }}
        >
          New Entry
        </Button>
      </Box>
      
      {/* Search and Filter Bar */}
      <Card 
        elevation={2}
        sx={{ mb: 4, borderRadius: 3, overflow: 'hidden' }}
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search journal entries..."
                value={searchTerm}
                onChange={handleSearchChange}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
                sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
              />
            </Grid>
            
            <Grid item xs={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
                sx={{ borderRadius: 2 }}
              >
                Filter {selectedTags.length > 0 && `(${selectedTags.length})`}
              </Button>
              <Menu
                anchorEl={filterMenuAnchor}
                open={Boolean(filterMenuAnchor)}
                onClose={() => setFilterMenuAnchor(null)}
                PaperProps={{
                  sx: { maxHeight: 300, width: 250 }
                }}
              >
                <MenuItem sx={{ justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2">Filter by Tags</Typography>
                  <Button size="small" onClick={clearFilters}>Clear All</Button>
                </MenuItem>
                <Divider />
                {allTags.length > 0 ? (
                  <Box sx={{ p: 2 }}>
                    {allTags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        onClick={() => toggleTag(tag)}
                        color={selectedTags.includes(tag) ? 'primary' : 'default'}
                        sx={{ m: 0.5 }}
                      />
                    ))}
                  </Box>
                ) : (
                  <MenuItem disabled>No tags available</MenuItem>
                )}
              </Menu>
            </Grid>
            
            <Grid item xs={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<SortIcon />}
                onClick={(e) => setSortMenuAnchor(e.currentTarget)}
                sx={{ borderRadius: 2 }}
              >
                Sort By
              </Button>
              <Menu
                anchorEl={sortMenuAnchor}
                open={Boolean(sortMenuAnchor)}
                onClose={() => setSortMenuAnchor(null)}
              >
                <MenuItem 
                  selected={sortOption === 'newest'} 
                  onClick={() => handleSortChange('newest')}
                >
                  Newest First
                </MenuItem>
                <MenuItem 
                  selected={sortOption === 'oldest'} 
                  onClick={() => handleSortChange('oldest')}
                >
                  Oldest First
                </MenuItem>
                <MenuItem 
                  selected={sortOption === 'title'} 
                  onClick={() => handleSortChange('title')}
                >
                  Title
                </MenuItem>
              </Menu>
            </Grid>
          </Grid>
          
          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {selectedTags.map(tag => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => toggleTag(tag)}
                  color="primary"
                  size="small"
                />
              ))}
              <Chip
                label="Clear All"
                onClick={clearFilters}
                variant="outlined"
                size="small"
              />
            </Box>
          )}
        </CardContent>
      </Card>
      
      {/* Journal Entries */}
      <AnimatePresence>
        {filteredEntries.length > 0 ? (
          <Grid 
            container 
            spacing={3}
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {filteredEntries.map((entry) => (
              <Grid item xs={12} sm={6} md={4} key={entry._id}>
                <Card 
                  elevation={2}
                  component={motion.div}
                  whileHover={{ y: -5, boxShadow: '0px 10px 20px rgba(0,0,0,0.1)' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  sx={{ 
                    borderRadius: 3, 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onClick={() => navigate(`/journal/${entry._id}`)}
                >
                  <CardContent sx={{ p: 3, flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
                        {entry.title || format(parseISO(entry.createdAt), 'MMMM d, yyyy')}
                      </Typography>
                      <Box>
                        <IconButton 
                          size="small" 
                          onClick={(e) => handleEntryMenuOpen(e, entry)}
                          sx={{ ml: 'auto' }}
                        >
                          <MoreIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      {truncateText(entry.content)}
                    </Typography>
                    
                    {/* Tags */}
                    {entry.tags && entry.tags.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {entry.tags.slice(0, 3).map((tag, index) => (
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
                        {entry.tags.length > 3 && (
                          <Chip 
                            label={`+${entry.tags.length - 3}`} 
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
                    )}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                        <Typography variant="caption" color="textSecondary">
                          {format(parseISO(entry.createdAt), 'MMM d, yyyy')}
                        </Typography>
                      </Box>
                      
                      {entry.mood && (
                        <Tooltip title={`Mood: ${entry.mood}/10`}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <HeartIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                            <Typography variant="body2">
                              {getMoodEmoji(entry.mood)}
                            </Typography>
                          </Box>
                        </Tooltip>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              py: 8
            }}
            component={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Paper 
              elevation={0} 
              sx={{ 
                p: 4, 
                borderRadius: 3, 
                bgcolor: 'background.default',
                textAlign: 'center',
                maxWidth: 500
              }}
            >
              {journalEntries.length === 0 ? (
                <>
                  <Typography variant="h6" gutterBottom>
                    No Journal Entries Yet
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Start documenting your thoughts, feelings, and experiences to track your mental health journey.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/journal/new')}
                    sx={{ mt: 2, borderRadius: 8, px: 3 }}
                  >
                    Create Your First Entry
                  </Button>
                </>
              ) : (
                <>
                  <Typography variant="h6" gutterBottom>
                    No Matching Entries
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    No journal entries match your current search or filter criteria.
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={clearFilters}
                    sx={{ mt: 2, borderRadius: 8, px: 3 }}
                  >
                    Clear Filters
                  </Button>
                </>
              )}
            </Paper>
          </Box>
        )}
      </AnimatePresence>
      
      {/* Floating Action Button for mobile */}
      <Box 
        sx={{ 
          position: 'fixed', 
          bottom: 20, 
          right: 20, 
          display: { xs: 'block', sm: 'none' } 
        }}
      >
        <Fab 
          color="primary" 
          aria-label="add"
          onClick={() => navigate('/journal/new')}
        >
          <AddIcon />
        </Fab>
      </Box>
      
      {/* Entry Menu */}
      <Menu
        anchorEl={entryMenuAnchor}
        open={Boolean(entryMenuAnchor)}
        onClose={handleEntryMenuClose}
      >
        <MenuItem onClick={() => {
          navigate(`/journal/edit/${selectedEntry?._id}`);
          handleEntryMenuClose();
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
      
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

export default Journal; 