import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Card, 
  CardContent, 
  CardHeader,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  styled,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';

// Styled components
const BreathingCircle = styled(motion.div)(({ theme }) => ({
  width: 250,
  height: 250,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  margin: '0 auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '1.5rem',
  fontWeight: 'bold',
  textAlign: 'center',
  boxShadow: `0 0 30px ${theme.palette.primary.main}80`
}));

const TimerDisplay = styled(Typography)(({ theme }) => ({
  fontSize: '3rem',
  fontWeight: 'bold',
  color: theme.palette.primary.main,
  textAlign: 'center',
  marginBottom: theme.spacing(2)
}));

const BreathingExercise = () => {
  const theme = useTheme();
  
  // States for exercise configuration
  const [breathingPattern, setBreathingPattern] = useState('4-4-4-4');
  const [showCustomInputs, setShowCustomInputs] = useState(false);
  const [customInhale, setCustomInhale] = useState(4);
  const [customHold1, setCustomHold1] = useState(4);
  const [customExhale, setCustomExhale] = useState(4);
  const [customHold2, setCustomHold2] = useState(4);
  const [exerciseDuration, setExerciseDuration] = useState(3);
  
  // States for exercise control
  const [isExerciseRunning, setIsExerciseRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [remainingTime, setRemainingTime] = useState(180); // 3 minutes default
  const [currentPhase, setCurrentPhase] = useState('ready');
  const [instruction, setInstruction] = useState('Prepare to begin...');
  const [circleText, setCircleText] = useState('Ready');
  
  // Animation variants for the breathing circle
  const circleVariants = {
    inhale: {
      scale: 1.4,
      backgroundColor: theme.palette.primary.light,
      transition: { duration: 4, ease: 'easeInOut' }
    },
    hold: {
      scale: 1.4,
      backgroundColor: theme.palette.primary.main,
      transition: { duration: 4, ease: 'easeInOut' }
    },
    exhale: {
      scale: 1,
      backgroundColor: theme.palette.primary.dark,
      transition: { duration: 4, ease: 'easeInOut' }
    },
    ready: {
      scale: 1,
      backgroundColor: theme.palette.primary.main
    }
  };
  
  // Refs for timer intervals
  const timerRef = useRef(null);
  const phaseTimerRef = useRef(null);
  
  // Breathing phases array
  const [breathingPhases, setBreathingPhases] = useState([]);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  
  // Handle pattern change
  const handlePatternChange = (event) => {
    const value = event.target.value;
    setBreathingPattern(value);
    setShowCustomInputs(value === 'custom');
  };
  
  // Format time for display (mm:ss)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Setup the exercise based on selected pattern
  const setupExercise = () => {
    // Set timer based on selected duration
    setRemainingTime(exerciseDuration * 60);
    
    // Parse breathing pattern
    let inhale, hold1, exhale, hold2;
    
    if (breathingPattern === 'custom') {
      inhale = customInhale;
      hold1 = customHold1;
      exhale = customExhale;
      hold2 = customHold2;
    } else {
      const parts = breathingPattern.split('-');
      inhale = parseInt(parts[0]);
      
      if (parts.length === 3) {
        // Pattern like 4-7-8
        hold1 = parseInt(parts[1]);
        exhale = parseInt(parts[2]);
        hold2 = 0;
      } else if (parts.length === 4) {
        // Pattern like 4-4-4-4
        hold1 = parseInt(parts[1]);
        exhale = parseInt(parts[2]);
        hold2 = parseInt(parts[3]);
      }
    }
    
    // Create phases array
    const phases = [];
    
    // Add inhale phase
    phases.push({
      type: 'inhale',
      duration: inhale,
      text: 'Breathe In',
      variant: 'inhale'
    });
    
    // Add hold phase if duration > 0
    if (hold1 > 0) {
      phases.push({
        type: 'hold1',
        duration: hold1,
        text: 'Hold',
        variant: 'hold'
      });
    }
    
    // Add exhale phase
    phases.push({
      type: 'exhale',
      duration: exhale,
      text: 'Breathe Out',
      variant: 'exhale'
    });
    
    // Add second hold phase if duration > 0
    if (hold2 > 0) {
      phases.push({
        type: 'hold2',
        duration: hold2,
        text: 'Hold',
        variant: 'hold'
      });
    }
    
    setBreathingPhases(phases);
    setCurrentPhaseIndex(0);
  };
  
  // Start the main timer
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setRemainingTime(prevTime => {
        if (prevTime <= 1) {
          stopExercise();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };
  
  // Start the breathing cycle
  const startBreathingCycle = () => {
    if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
    
    if (breathingPhases.length === 0) return;
    
    // Start with the first phase
    const initialPhase = breathingPhases[0];
    setCurrentPhase(initialPhase.variant);
    setInstruction(initialPhase.text);
    setCircleText(initialPhase.text);
    
    let phaseTimeRemaining = initialPhase.duration;
    let currentIndex = 0;
    
    phaseTimerRef.current = setInterval(() => {
      // Update phase time
      phaseTimeRemaining -= 1;
      
      // If phase complete, move to next phase
      if (phaseTimeRemaining <= 0) {
        currentIndex = (currentIndex + 1) % breathingPhases.length;
        const nextPhase = breathingPhases[currentIndex];
        setCurrentPhase(nextPhase.variant);
        setInstruction(nextPhase.text);
        setCircleText(nextPhase.text);
        phaseTimeRemaining = nextPhase.duration;
        setCurrentPhaseIndex(currentIndex);
      }
    }, 1000);
  };
  
  // Start the exercise
  const startExercise = () => {
    setupExercise();
    setIsExerciseRunning(true);
    startTimer();
    startBreathingCycle();
  };
  
  // Pause/resume the exercise
  const togglePause = () => {
    if (isPaused) {
      // Resume
      setIsPaused(false);
      startTimer();
      startBreathingCycle();
    } else {
      // Pause
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
      if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
    }
  };
  
  // Stop the exercise
  const stopExercise = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
    
    setIsExerciseRunning(false);
    setIsPaused(false);
    setCurrentPhase('ready');
    setInstruction('Prepare to begin...');
    setCircleText('Ready');
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
    };
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h2" component="h1" align="center" gutterBottom>
        Breathing Exercise
      </Typography>
      <Typography variant="h5" align="center" color="textSecondary" paragraph>
        Practice mindful breathing to reduce stress and increase focus
      </Typography>
      
      {/* Exercise Configuration */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardHeader 
          title="Guided Breathing" 
          sx={{ bgcolor: 'primary.main', color: 'white' }}
        />
        <CardContent>
          {!isExerciseRunning ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6} sx={{ mx: 'auto' }}>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Breathing Pattern</InputLabel>
                  <Select
                    value={breathingPattern}
                    onChange={handlePatternChange}
                    label="Breathing Pattern"
                  >
                    <MenuItem value="4-4-4-4">Box Breathing (4-4-4-4)</MenuItem>
                    <MenuItem value="4-7-8">Relaxing Breath (4-7-8)</MenuItem>
                    <MenuItem value="5-2-5">Calming Breath (5-2-5)</MenuItem>
                    <MenuItem value="6-3-6-3">Square Breathing (6-3-6-3)</MenuItem>
                    <MenuItem value="custom">Custom Pattern</MenuItem>
                  </Select>
                </FormControl>
                
                {showCustomInputs && (
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={3}>
                      <TextField
                        label="Inhale"
                        type="number"
                        value={customInhale}
                        onChange={(e) => setCustomInhale(parseInt(e.target.value))}
                        inputProps={{ min: 1, max: 10 }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        label="Hold"
                        type="number"
                        value={customHold1}
                        onChange={(e) => setCustomHold1(parseInt(e.target.value))}
                        inputProps={{ min: 0, max: 10 }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        label="Exhale"
                        type="number"
                        value={customExhale}
                        onChange={(e) => setCustomExhale(parseInt(e.target.value))}
                        inputProps={{ min: 1, max: 10 }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={3}>
                      <TextField
                        label="Hold"
                        type="number"
                        value={customHold2}
                        onChange={(e) => setCustomHold2(parseInt(e.target.value))}
                        inputProps={{ min: 0, max: 10 }}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                )}
                
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Exercise Duration</InputLabel>
                  <Select
                    value={exerciseDuration}
                    onChange={(e) => setExerciseDuration(e.target.value)}
                    label="Exercise Duration"
                  >
                    <MenuItem value={1}>1 minute</MenuItem>
                    <MenuItem value={2}>2 minutes</MenuItem>
                    <MenuItem value={3}>3 minutes</MenuItem>
                    <MenuItem value={5}>5 minutes</MenuItem>
                    <MenuItem value={10}>10 minutes</MenuItem>
                  </Select>
                </FormControl>
                
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={startExercise}
                  >
                    Start Exercise
                  </Button>
                </Box>
              </Grid>
            </Grid>
          ) : (
            <Box>
              <TimerDisplay variant="h2">
                {formatTime(remainingTime)}
              </TimerDisplay>
              
              <Typography variant="h4" align="center" sx={{ mb: 3 }}>
                {instruction}
              </Typography>
              
              <BreathingCircle
                variants={circleVariants}
                animate={currentPhase}
              >
                {circleText}
              </BreathingCircle>
              
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={togglePause}
                  sx={{ mx: 1 }}
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="large"
                  onClick={stopExercise}
                  sx={{ mx: 1 }}
                >
                  Stop
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
      
      {/* Benefits Section */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardHeader 
          title="Benefits of Breathing Exercises" 
          sx={{ bgcolor: 'info.main', color: 'white' }}
        />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>Physical Benefits</Typography>
              <List>
                <ListItem>
                  <ListItemText primary="Reduces blood pressure" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Improves immune function" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Increases energy levels" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Relaxes muscles and reduces tension" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Improves sleep quality" />
                </ListItem>
              </List>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>Mental Benefits</Typography>
              <List>
                <ListItem>
                  <ListItemText primary="Reduces stress and anxiety" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Improves focus and concentration" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Enhances emotional regulation" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Promotes mindfulness" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Creates mental clarity" />
                </ListItem>
              </List>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>Best Practices</Typography>
              <List>
                <ListItem>
                  <ListItemText primary="Find a quiet, comfortable space" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Practice at the same time daily" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Start with shorter sessions" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Breathe through your nose when possible" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Focus on the sensations of breathing" />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default BreathingExercise; 