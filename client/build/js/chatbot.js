// Chatbot functionality for mindfulme app using MongoDB API
class MindfulChatbot {
  constructor() {
    this.token = localStorage.getItem('token');
    this.conversationId = null;
    this.chatContainer = document.getElementById('chat-messages');
    this.userInput = document.getElementById('user-input');
    this.sendBtn = document.getElementById('send-btn');
    this.typingIndicator = document.getElementById('typing-indicator');
    this.clearChatBtn = document.getElementById('clear-chat');
    
    this.responseDelay = 1000; // delay for bot response in ms
    
    // Bind event listeners
    this.sendBtn.addEventListener('click', () => this.sendMessage());
    this.userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });
    this.clearChatBtn.addEventListener('click', () => this.clearChat());
  }
  
  // Initialize the chatbot
  async initialize() {
    try {
      // Start a new conversation
      const response = await window.mindfulmeAPI.chatbot.startConversation(this.token);
      this.conversationId = response.data.conversationId;
      
      // Display initial greeting
      const initialMessage = response.data.message.message;
      this.chatContainer.innerHTML = `
        <div class="chat-message bot-message">
          <p>${initialMessage}</p>
        </div>
      `;
      
      console.log('Chatbot initialized with conversation ID:', this.conversationId);
    } catch (error) {
      console.error('Error initializing chatbot:', error);
      // Display a fallback greeting
      this.chatContainer.innerHTML = `
        <div class="chat-message bot-message">
          <p>Hello! How can I help you today?</p>
        </div>
      `;
    }
  }
  
  // Send a message to the chatbot
  async sendMessage() {
    const message = this.userInput.value.trim();
    
    // Don't send empty messages
    if (message === '') return;
    
    // Add user message to chat
    this.addMessage(message, 'user');
    this.userInput.value = '';
    
    // Show typing indicator
    this.typingIndicator.classList.remove('d-none');
    
    try {
      // Send message to API
      const response = await window.mindfulmeAPI.chatbot.sendMessage(
        this.conversationId,
        message,
        this.token
      );
      
      // Hide typing indicator after delay
      setTimeout(() => {
        this.typingIndicator.classList.add('d-none');
        
        // Add bot response to chat
        const botResponse = response.data.botMessage.message;
        this.addMessage(botResponse, 'bot');
      }, this.responseDelay);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Hide typing indicator
      setTimeout(() => {
        this.typingIndicator.classList.add('d-none');
        
        // Add error message
        this.addMessage("I'm having trouble connecting right now. Please try again later.", 'bot');
      }, this.responseDelay);
    }
  }
  
  // Add a message to the chat
  addMessage(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender === 'user' ? 'user-message' : 'bot-message'}`;
    
    // Process the message to render markdown links
    let processedMessage = message;
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    processedMessage = processedMessage.replace(linkRegex, '<a href="$2" class="chat-link">$1</a>');
    
    // Process line breaks
    processedMessage = processedMessage.replace(/\n/g, '<br>');
    
    messageDiv.innerHTML = `<p>${processedMessage}</p>`;
    this.chatContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
  }
  
  // Clear the chat
  async clearChat() {
    try {
      // Clear conversation on server
      await window.mindfulmeAPI.chatbot.clearConversation(this.conversationId, this.token);
      
      // Start a new conversation
      const response = await window.mindfulmeAPI.chatbot.startConversation(this.token);
      this.conversationId = response.data.conversationId;
      
      // Display initial greeting
      const initialMessage = response.data.message.message;
      this.chatContainer.innerHTML = `
        <div class="chat-message bot-message">
          <p>${initialMessage}</p>
        </div>
      `;
    } catch (error) {
      console.error('Error clearing chat:', error);
      
      // Fallback to local clear if API call fails
      const fallbackGreeting = "Hello! How can I help you today?";
      this.chatContainer.innerHTML = `
        <div class="chat-message bot-message">
          <p>${fallbackGreeting}</p>
        </div>
      `;
    }
  }
  
  // Load previous messages from a conversation
  async loadConversation(conversationId = null) {
    if (!conversationId) return;
    
    try {
      const response = await window.mindfulmeAPI.chatbot.getConversation(conversationId, this.token);
      this.conversationId = conversationId;
      
      // Clear existing messages
      this.chatContainer.innerHTML = '';
      
      // Add messages to chat
      response.data.forEach(msg => {
        this.addMessage(msg.message, msg.isUserMessage ? 'user' : 'bot');
      });
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  }
}

// Initialize the chatbot when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if the user is logged in and chatbot elements exist
  const token = localStorage.getItem('token');
  const chatMessagesEl = document.getElementById('chat-messages');
  
  if (token && chatMessagesEl) {
    const chatbot = new MindfulChatbot();
    chatbot.initialize();
    
    // Expose chatbot to window for debugging
    window.mindfulChatbot = chatbot;
  }
}); 