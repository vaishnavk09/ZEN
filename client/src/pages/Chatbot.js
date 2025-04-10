import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  IconButton, 
  Divider, 
  Avatar, 
  Chip,
  Card,
  CardContent,
  Grid,
  Tooltip,
  Link
} from '@mui/material';
import { 
  Send as SendIcon, 
  Delete as DeleteIcon, 
  Psychology as BotIcon,
  SentimentSatisfied as MoodIcon,
  Lightbulb as TipIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from 'react-spring';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link as RouterLink } from 'react-router-dom';

// Suggested questions for the user
const suggestedQuestions = [
  "How can I manage anxiety?",
  "What are signs of depression?",
  "Tips for better sleep?",
  "How to help a friend with mental health issues?",
  "What are healthy coping mechanisms?",
  "How does exercise affect mental health?",
  "What is mindfulness meditation?",
  "How to set healthy boundaries?"
];

const Chatbot = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Animation for the typing indicator
  const typingAnimation = useSpring({
    opacity: typing ? 1 : 0,
    y: typing ? 0 : 10,
    config: { tension: 300, friction: 20 }
  });
  
  // Fetch chat history on component mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        const res = await axios.get('/api/chatbot/messages', config);
        
        if (res.data.success) {
          setMessages(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching chat messages:', err);
      }
    };
    
    fetchMessages();
    
    // If no messages, add a welcome message
    if (messages.length === 0) {
      setMessages([
        {
          _id: 'welcome',
          message: `Hello ${user?.name || 'there'}! I'm your mental health assistant. How can I help you today?`,
          isUser: false,
          createdAt: new Date().toISOString()
        }
      ]);
    }
  }, [user]);
  
  // Scroll to bottom of chat when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage = input;
    setInput('');
    
    // Optimistically add user message to UI
    const newUserMessage = {
      _id: `temp-${Date.now()}`,
      message: userMessage,
      isUser: true,
      createdAt: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    
    // Show typing indicator
    setTyping(true);
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      const res = await axios.post('/api/chatbot/message', { message: userMessage }, config);
      
      if (res.data.success) {
        // Add a slight delay to make it feel more natural
        setTimeout(() => {
          setTyping(false);
          setMessages(prev => [
            ...prev.filter(msg => msg._id !== newUserMessage._id),
            res.data.data.userMessage,
            res.data.data.botMessage
          ]);
          setLoading(false);
        }, 1000);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setTyping(false);
      setLoading(false);
      
      // Add error message
      setMessages(prev => [
        ...prev,
        {
          _id: `error-${Date.now()}`,
          message: "I'm having trouble connecting right now. Please try again later.",
          isUser: false,
          createdAt: new Date().toISOString()
        }
      ]);
    }
  };
  
  const handleSuggestedQuestion = (question) => {
    setInput(question);
    handleSendMessage();
  };
  
  const clearChat = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.delete('/api/chatbot/messages', config);
      
      // Reset messages with welcome message
      setMessages([
        {
          _id: 'welcome-new',
          message: `Hello ${user?.name || 'there'}! I'm your mental health assistant. How can I help you today?`,
          isUser: false,
          createdAt: new Date().toISOString()
        }
      ]);
    } catch (err) {
      console.error('Error clearing chat:', err);
    }
  };
  
  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Replace the existing renderMessageWithLinks function with this improved version
  const renderMessageWithLinks = (message) => {
    // Split the message into lines
    return message.split('\n').map((line, lineIndex) => {
      // Check if the line contains links to breathing exercises
      if (line.includes('/breathing-exercises') || line.includes('breathing exercises')) {
        // Split the line at the link
        const parts = line.split(/(\[Click here to access our breathing exercises\](?:\/breathing-exercises\))?)/g);
        
        return (
          <React.Fragment key={`line-${lineIndex}`}>
            {parts.map((part, partIndex) => {
              if (part.includes('Click here to access our breathing exercises')) {
                return (
                  <Link 
                    key={`link-${lineIndex}-${partIndex}`} 
                    to="/breathing"
                    component={RouterLink}
                    sx={{ 
                      color: 'primary.main', 
                      fontWeight: 'bold',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Click here to access our breathing exercises
                  </Link>
                );
              }
              return part;
            })}
            {lineIndex < message.split('\n').length - 1 && <br />}
          </React.Fragment>
        );
      }
      
      // Process regular markdown links
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let lastIndex = 0;
      const elements = [];
      let match;
      
      // Find all markdown links in the line
      while ((match = linkRegex.exec(line)) !== null) {
        // Add text before the link
        if (match.index > lastIndex) {
          elements.push(line.substring(lastIndex, match.index));
        }
        
        // Add the link component
        elements.push(
          <Link 
            key={`link-${lineIndex}-${match.index}`}
            href={match[2]} 
            color="primary"
            sx={{ textDecoration: 'underline' }}
          >
            {match[1]}
          </Link>
        );
        
        lastIndex = match.index + match[0].length;
      }
      
      // Add remaining text
      if (lastIndex < line.length) {
        elements.push(line.substring(lastIndex));
      }
      
      // If no links were found, just return the line
      if (elements.length === 0) {
        elements.push(line);
      }
      
      // Return the line with links if present, with line breaks
      return (
        <React.Fragment key={`line-${lineIndex}`}>
          {elements}
          {lineIndex < message.split('\n').length - 1 && <br />}
        </React.Fragment>
      );
    });
  };
  
  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card 
            elevation={3}
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            sx={{ 
              height: 'calc(100vh - 120px)',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              overflow: 'hidden'
            }}
          >
            <Box sx={{ 
              p: 2, 
              bgcolor: 'primary.main', 
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.dark', mr: 1 }}>
                  <BotIcon />
                </Avatar>
                <Typography variant="h6">Mental Health Assistant</Typography>
              </Box>
              <Tooltip title="Clear chat history">
                <IconButton color="inherit" onClick={clearChat} disabled={loading}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
            
            <Box sx={{ 
              flexGrow: 1, 
              p: 2, 
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}>
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg._id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      alignSelf: msg.isUser ? 'flex-end' : 'flex-start',
                      maxWidth: '80%'
                    }}
                  >
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        bgcolor: msg.isUser ? 'primary.light' : 'background.paper',
                        color: msg.isUser ? 'white' : 'text.primary',
                        position: 'relative'
                      }}
                    >
                      <Typography variant="body1">
                        {renderMessageWithLinks(msg.message)}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          display: 'block', 
                          mt: 1, 
                          textAlign: 'right',
                          opacity: 0.7
                        }}
                      >
                        {formatTime(msg.createdAt)}
                      </Typography>
                    </Paper>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Typing indicator */}
              <animated.div style={typingAnimation}>
                {typing && (
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: 'background.paper',
                      alignSelf: 'flex-start',
                      maxWidth: '80%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Box sx={{ display: 'flex' }}>
                      <Box
                        component={motion.div}
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.5, delay: 0 }}
                        sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', mx: 0.5 }}
                      />
                      <Box
                        component={motion.div}
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.5, delay: 0.15 }}
                        sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', mx: 0.5 }}
                      />
                      <Box
                        component={motion.div}
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.5, delay: 0.3 }}
                        sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', mx: 0.5 }}
                      />
                    </Box>
                    <Typography variant="body2" color="textSecondary">Typing...</Typography>
                  </Paper>
                )}
              </animated.div>
              
              <div ref={messagesEndRef} />
            </Box>
            
            <Divider />
            
            <Box 
              component="form" 
              onSubmit={handleSendMessage}
              sx={{ 
                p: 2, 
                display: 'flex', 
                alignItems: 'center',
                gap: 1
              }}
            >
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3
                  }
                }}
              />
              <Button
                variant="contained"
                color="primary"
                endIcon={<SendIcon />}
                disabled={!input.trim() || loading}
                type="submit"
                sx={{ 
                  borderRadius: 3,
                  px: 3,
                  py: 1.5
                }}
              >
                Send
              </Button>
            </Box>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card 
            elevation={3}
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            sx={{ 
              borderRadius: 3,
              mb: 3
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TipIcon color="primary" /> Suggested Questions
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {suggestedQuestions.map((question, index) => (
                  <Chip
                    key={index}
                    label={question}
                    onClick={() => handleSuggestedQuestion(question)}
                    color="primary"
                    variant="outlined"
                    sx={{ 
                      m: 0.5,
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: 2
                      }
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
          
          <Card 
            elevation={3}
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            sx={{ 
              borderRadius: 3
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MoodIcon color="primary" /> Mental Health Tips
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Remember that it's okay to ask for help. Mental health is just as important as physical health.
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Practice self-care regularly. This includes adequate sleep, healthy eating, physical activity, and activities you enjoy.
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Mindfulness and deep breathing can help reduce anxiety and stress in the moment.
              </Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={() => handleSuggestedQuestion("What are some self-care practices for mental health?")}
                sx={{ mt: 1 }}
              >
                Learn More About Self-Care
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Chatbot; 