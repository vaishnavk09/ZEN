// API client for Mindful Me backend
const API_URL = 'http://localhost:5001/api';

// Helper function for making API requests
async function fetchAPI(endpoint, method = 'GET', data = null, token = null) {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  // Add authentication token if provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options = {
    method,
    headers
  };
  
  // Add request body for POST/PUT requests
  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API request failed with status ${response.status}`);
  }
  
  return response.json();
}

// Create MindfulMe API client
window.mindfulmeAPI = {
  // Auth endpoints
  auth: {
    // Login user
    login: async (email, password) => {
      return fetchAPI('/auth/login', 'POST', { email, password });
    },
    
    // Register new user
    register: async (name, email, password) => {
      return fetchAPI('/auth/register', 'POST', { name, email, password });
    },
    
    // Get current user info
    getCurrentUser: async (token) => {
      return fetchAPI('/auth/me', 'GET', null, token);
    },
    
    // Update user profile
    updateProfile: async (userData, token) => {
      return fetchAPI('/auth/profile', 'PUT', userData, token);
    },
    
    // Change password
    changePassword: async (currentPassword, newPassword, token) => {
      return fetchAPI('/auth/change-password', 'POST', { currentPassword, newPassword }, token);
    }
  },
  
  // User endpoints
  user: {
    // Get user settings
    getSettings: async (token) => {
      return fetchAPI('/user/settings', 'GET', null, token);
    },
    
    // Update user settings
    updateSettings: async (settings, token) => {
      return fetchAPI('/user/settings', 'PUT', settings, token);
    }
  },
  
  // Journal endpoints
  journal: {
    // Get all journal entries
    getEntries: async (token) => {
      return fetchAPI('/journal', 'GET', null, token);
    },
    
    // Get a specific journal entry
    getEntry: async (entryId, token) => {
      return fetchAPI(`/journal/${entryId}`, 'GET', null, token);
    },
    
    // Create a new journal entry
    createEntry: async (entryData, token) => {
      return fetchAPI('/journal', 'POST', entryData, token);
    },
    
    // Update a journal entry
    updateEntry: async (entryId, entryData, token) => {
      return fetchAPI(`/journal/${entryId}`, 'PUT', entryData, token);
    },
    
    // Delete a journal entry
    deleteEntry: async (entryId, token) => {
      return fetchAPI(`/journal/${entryId}`, 'DELETE', null, token);
    }
  },
  
  // Chat endpoints
  chat: {
    // Get chat history
    getHistory: async (token) => {
      return fetchAPI('/chat/history', 'GET', null, token);
    },
    
    // Send message to chatbot
    sendMessage: async (message, conversationId = null, token) => {
      return fetchAPI('/chat/message', 'POST', { message, conversationId }, token);
    },
    
    // Create a new conversation
    createConversation: async (title, token) => {
      return fetchAPI('/chat/conversation', 'POST', { title }, token);
    },
    
    // Get conversation list
    getConversations: async (token) => {
      return fetchAPI('/chat/conversations', 'GET', null, token);
    },
    
    // Delete a conversation
    deleteConversation: async (conversationId, token) => {
      return fetchAPI(`/chat/conversation/${conversationId}`, 'DELETE', null, token);
    },
    
    // Clear conversation history
    clearHistory: async (conversationId, token) => {
      return fetchAPI(`/chat/clear/${conversationId}`, 'POST', null, token);
    }
  },
  
  // Mood tracking endpoints
  mood: {
    // Get all mood entries
    getMoods: async (token) => {
      return fetchAPI('/mood', 'GET', null, token);
    },
    
    // Create a new mood entry
    createMood: async (moodData, token) => {
      return fetchAPI('/mood', 'POST', moodData, token);
    },
    
    // Delete a mood entry
    deleteMood: async (moodId, token) => {
      return fetchAPI(`/mood/${moodId}`, 'DELETE', null, token);
    },
    
    // Get mood statistics
    getStats: async (period = 'week', token) => {
      return fetchAPI(`/mood/stats?period=${period}`, 'GET', null, token);
    }
  }
}; 