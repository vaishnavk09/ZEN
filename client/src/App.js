import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider as CustomThemeProvider } from './context/ThemeContext';

// Components
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Loader from './components/Loader';
import JournalForm from './components/JournalForm';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Journal from './pages/Journal';
import JournalDetail from './pages/JournalDetail';
import MoodTracker from './pages/MoodTracker';
import Chatbot from './pages/Chatbot';
import BreathingExercise from './pages/BreathingExercise';
import NotFound from './pages/NotFound';

const App = () => {
  return (
    <AuthProvider>
      <CustomThemeProvider>
        <AppContent />
      </CustomThemeProvider>
    </AuthProvider>
  );
};

const AppContent = () => {
  const { darkMode } = React.useContext(CustomThemeProvider);
  
  // Create MUI theme based on dark mode preference
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            main: '#6a5acd', // Slate blue
          },
          secondary: {
            main: '#9370db', // Medium purple
          },
          background: {
            default: darkMode ? '#121212' : '#f5f7fa',
            paper: darkMode ? '#1e1e1e' : '#ffffff',
          },
        },
        typography: {
          fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontWeight: 600,
          },
          h2: {
            fontWeight: 600,
          },
          h3: {
            fontWeight: 600,
          },
          h4: {
            fontWeight: 600,
          },
          h5: {
            fontWeight: 600,
          },
          h6: {
            fontWeight: 600,
          },
        },
        shape: {
          borderRadius: 8,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 500,
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                boxShadow: darkMode 
                  ? '0 4px 20px 0 rgba(0, 0, 0, 0.5)'
                  : '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
              },
            },
          },
        },
      }),
    [darkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="journal" element={<Journal />} />
            <Route path="journal/:id" element={<JournalDetail />} />
            <Route path="journal/new" element={<JournalForm isEditing={false} />} />
            <Route path="journal/edit/:id" element={<JournalForm isEditing={true} />} />
            <Route path="mood" element={<MoodTracker />} />
            <Route path="chatbot" element={<Chatbot />} />
            <Route path="breathing" element={<BreathingExercise />} />
          </Route>
          
          {/* Fallback Routes */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App; 