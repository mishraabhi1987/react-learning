import React, { useState, useEffect, useRef } from "react";
import "./GeminiChat.css";
// This code is a React component that connects to Gemini API to provide AI-powered responses.

// Replace with your actual Gemini API key
const GEMINI_API_KEY = "AIzaSyBLca4rDZUZJEoKJAgCkpUr2aNpStP9Hzs";

async function callGeminiAPI(prompt) {
  try {
    console.log("Making API call with prompt:", prompt);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: 100,
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
          },
        }),
      }
    );

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const data = await response.json();
    console.log("API Response data:", data);

    // Check for blocked content or safety issues
    if (
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].finishReason === "SAFETY"
    ) {
      return "Sorry, the content was blocked due to safety reasons. Please try a different prompt.";
    }

    // Extract the response text
    if (
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] &&
      data.candidates[0].content.parts[0].text
    ) {
      return data.candidates[0].content.parts[0].text.trim();
    } else {
      console.error("Unexpected response structure:", data);
      return "Sorry, I received an unexpected response from the API. Please try again.";
    }
  } catch (error) {
    console.error("Detailed error calling Gemini API:", error);

    // Handle network errors
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      return "Network error: Please check your internet connection and try again.";
    }

    // Handle API errors
    if (error.message.includes("HTTP error")) {
      return `API Error: ${error.message}. Please check your API key and try again.`;
    }

    return `Error: ${error.message}. Please check the console for more details.`;
  }
}

function GeminiChat() {
  const [prompt, setPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessKey, setAccessKey] = useState("");
  const [accessError, setAccessError] = useState("");
  const chatContentRef = useRef(null);

  const CORRECT_ACCESS_KEY = "mishragemini087";

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  const handleAccessSubmit = (e) => {
    e.preventDefault();
    if (accessKey === CORRECT_ACCESS_KEY) {
      setIsAuthenticated(true);
      setAccessError("");
    } else {
      setAccessError("Invalid access key. Please try again.");
      setAccessKey("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: prompt.trim(),
      timestamp: new Date(),
    };

    // Add user message to chat history
    setChatHistory((prev) => [...prev, userMessage]);

    setLoading(true);
    setError("");

    const currentPrompt = prompt.trim();
    setPrompt(""); // Clear input immediately

    try {
      const aiResponse = await callGeminiAPI(currentPrompt);

      // Check if response contains error
      if (
        aiResponse.startsWith("Error:") ||
        aiResponse.startsWith("API Error:") ||
        aiResponse.startsWith("Network error:")
      ) {
        setError(aiResponse);
      } else {
        const botMessage = {
          id: Date.now() + 1,
          type: "bot",
          content: aiResponse,
          timestamp: new Date(),
        };
        setChatHistory((prev) => [...prev, botMessage]);
      }
    } catch (error) {
      setError("Unexpected error occurred. Please try again.");
      console.error("Handle submit error:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setPrompt("");
    setChatHistory([]);
    setError("");
  };

  // Show access screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="gemini-chat-container">
        <div className="access-screen">
          <div className="access-content">
            <h2 className="access-title">🔐 Access Required</h2>
            <p className="access-description">
              Please enter the access key to continue to Gemini Chat
            </p>
            
            <form onSubmit={handleAccessSubmit} className="access-form">
              <div className="access-input-section">
                <label htmlFor="accessKey" className="access-label">
                  Access Key:
                </label>
                <input
                  type="password"
                  id="accessKey"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  placeholder="Enter access key..."
                  required
                  className="access-input"
                  autoFocus
                />
              </div>
              
              {accessError && (
                <div className="access-error">
                  ⚠️ {accessError}
                </div>
              )}
              
              <button type="submit" className="access-button">
                🚀 Access Chat
              </button>
            </form>
            
            <div className="access-footer">
              <p>🤖 Powered by Google Gemini AI</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gemini-chat-container">
      <h2 className="gemini-chat-header">
        AI Chat with Gemini
        <div className="gemini-chat-subtitle">
          Limited to 100 tokens per response
        </div>
      </h2>

      <div className="chat-content" ref={chatContentRef}>
        {chatHistory.length === 0 && !loading && (
          <div className="welcome-message">
            <div className="welcome-content">
              <h3>👋 Welcome to Gemini Chat!</h3>
              <p>
                Start a conversation by typing your question below. I'm here to
                help with:
              </p>
              <ul>
                <li>Answering questions</li>
                <li>Providing explanations</li>
                <li>Creative writing</li>
                <li>Problem solving</li>
                <li>And much more!</li>
              </ul>
              <p>
                <em>
                  Note: Responses are limited to 100 tokens for quick
                  interactions.
                </em>
              </p>
            </div>
          </div>
        )}

        <div className="messages-container">
          {error && (
            <div className="error-container">
              <h4 className="error-title">⚠️ Error:</h4>
              <div className="error-message">{error}</div>
            </div>
          )}

          {chatHistory.map((message) => (
            <div
              key={message.id}
              className={`message-container ${
                message.type === "user" ? "user-message" : "bot-message"
              }`}
            >
              <div className="message-header">
                <span className="message-sender">
                  {message.type === "user" ? "👤 You" : "🤖 AI"}
                </span>
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="message-content">{message.content}</div>
            </div>
          ))}

          {loading && (
            <div className="loading-container">
              <div className="loading-main-text">🤔 Generating response...</div>
              <div className="loading-sub-text">
                This may take a few seconds
              </div>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-container">
        <div className="input-section">
          <div className="input-header">
            <label className="input-label">Enter your prompt:</label>
            <span className="character-counter">
              {prompt.length} characters
            </span>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask me anything... (Keep it concise for better results with 100 token limit)"
            required
            rows={4}
            maxLength={500}
            className="textarea-input"
          />
        </div>

        <div className="button-container">
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="submit-button"
          >
            {loading ? "🤔 Thinking..." : "🚀 Ask Gemini"}
          </button>

          <button
            type="button"
            onClick={clearAll}
            disabled={loading}
            className="clear-button"
          >
            {chatHistory.length > 0 ? "Clear Chat" : "Clear"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default GeminiChat;
