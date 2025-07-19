import React, { useState } from "react";
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
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResponse("");
    setError("");

    try {
      const aiResponse = await callGeminiAPI(prompt);

      // Check if response contains error
      if (
        aiResponse.startsWith("Error:") ||
        aiResponse.startsWith("API Error:") ||
        aiResponse.startsWith("Network error:")
      ) {
        setError(aiResponse);
      } else {
        setResponse(aiResponse);
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
    setResponse("");
    setError("");
  };

  return (
    <div className="gemini-chat-container">
      <h2 className="gemini-chat-header">
        AI Chat with Gemini
        <div className="gemini-chat-subtitle">
          Limited to 100 tokens per response
        </div>
      </h2>

      <div className="chat-content">
        {error && (
          <div className="error-container">
            <h4 className="error-title">⚠️ Error:</h4>
            <div className="error-message">{error}</div>
          </div>
        )}

        {response && (
          <div className="response-container">
            <h4 className="response-title">🤖 AI Response:</h4>
            <div className="response-text">{response}</div>
          </div>
        )}

        {loading && (
          <div className="loading-container">
            <div className="loading-main-text">🤔 Generating response...</div>
            <div className="loading-sub-text">This may take a few seconds</div>
          </div>
        )}
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
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}

export default GeminiChat;
