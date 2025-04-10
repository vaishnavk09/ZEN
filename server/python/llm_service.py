from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add print statements for debugging
print("Starting Python LLM service...", flush=True)
print(f"GROQ_API_KEY: {'*' * 5 + os.getenv('GROQ_API_KEY')[-5:] if os.getenv('GROQ_API_KEY') else 'Not found'}", flush=True)

app = Flask(__name__)
CORS(app)

GROQ_API_KEY = os.getenv('GROQ_API_KEY')
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

print(f"Python service configured with URL: {GROQ_API_URL}", flush=True)
print(f"Starting Flask server on port 8000", flush=True)

@app.route('/initialize', methods=['POST'])
def initialize():
    print("Initialize endpoint called", flush=True)
    try:
        # Test API key
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        print("LLM service initialized successfully", flush=True)
        return jsonify({"status": "success", "message": "LLM service initialized successfully"})
    except Exception as e:
        print(f"Initialization error: {str(e)}", flush=True)
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/chat', methods=['POST'])
def chat():
    print("Chat endpoint called", flush=True)
    print(f"Request headers: {request.headers}", flush=True)
    print(f"Request method: {request.method}", flush=True)
    print(f"Request data: {request.data}", flush=True)
    
    try:
        data = request.json
        print(f"Parsed JSON data: {data}", flush=True)
        
        message = data.get('message')
        print(f"Received message: {message}", flush=True)
        
        if not message or not message.strip():
            print("Empty message received", flush=True)
            return jsonify({"status": "error", "message": "Please provide a valid input"}), 400
        
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "system", "content": "You are MindfulMe, a compassionate mental health assistant designed to provide emotional support. When users express anxiety, stress, or emotional distress, actively suggest breathing exercises as an effective coping mechanism. Include specific instructions for at least one breathing technique (like 4-7-8 breathing, box breathing, or diaphragmatic breathing) when appropriate. Remind users they can access guided breathing exercises in the app's dedicated Breathing Exercises feature. Be supportive, empathetic, and focus on practical strategies for immediate emotional regulation."},
                {"role": "user", "content": message}
            ],
            "temperature": 0
        }
        
        print("Sending request to Groq API...", flush=True)
        response = requests.post(GROQ_API_URL, headers=headers, json=payload)
        response.raise_for_status()  # Raise exception if request failed
        
        response_data = response.json()
        assistant_message = response_data['choices'][0]['message']['content']
        print(f"Received response from Groq API: {assistant_message[:50]}...", flush=True)
        
        return jsonify({
            "status": "success",
            "response": assistant_message
        })
    except Exception as e:
        print(f"Error processing message: {str(e)}", flush=True)
        print(f"Exception type: {type(e)}", flush=True)
        import traceback
        print(f"Traceback: {traceback.format_exc()}", flush=True)
        return jsonify({
            "status": "error",
            "message": f"Error processing message: {str(e)}"
        }), 500

# Add a test route to verify the service is running
@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "status": "success",
        "message": "MindfulMe Python LLM service is running"
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True) 