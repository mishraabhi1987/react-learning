import React, { useState, useEffect, useRef } from "react";
import "./GeminiChat.css";
// This code is a React component that connects to Gemini API to provide AI-powered responses.

// Get API key from environment variables
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

// Validate API key is available
if (!GEMINI_API_KEY) {
  console.error(
    "Gemini API key not found. Please set REACT_APP_GEMINI_API_KEY in your environment variables."
  );
}

async function callGeminiAPI(prompt) {
  try {
    // Check if API key is available
    if (!GEMINI_API_KEY) {
      throw new Error(
        "API key not configured. Please contact the administrator."
      );
    }

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
  const [products, setProducts] = useState([]);
  const chatContentRef = useRef(null);

  const CORRECT_ACCESS_KEY = "mishragemini087";

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  // Function to detect if prompt is asking to add a product
  const isProductRequest = (text) => {
    const productKeywords = [
      "add product",
      "create product",
      "product details",
      "add item",
      "new product",
      "product information",
    ];
    return productKeywords.some((keyword) =>
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  // Function to extract product name from prompt
  const extractProductName = (text) => {
    // Look for patterns like "add product iPhone" or "create product details for Samsung"
    const patterns = [
      /add product\s+(.+)/i,
      /create product\s+(.+)/i,
      /product details\s+(?:for\s+)?(.+)/i,
      /add item\s+(.+)/i,
      /new product\s+(.+)/i,
      /product information\s+(?:for\s+)?(.+)/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // If no pattern matches, look for the last word/phrase after common keywords
    const words = text.toLowerCase().split(" ");
    const keywordIndex = words.findIndex((word) =>
      ["product", "item"].includes(word)
    );

    if (keywordIndex !== -1 && keywordIndex < words.length - 1) {
      return words.slice(keywordIndex + 1).join(" ");
    }

    return null;
  };

  // Function to add product to the list
  const addProduct = (productInfo) => {
    const newProduct = {
      id: Date.now(),
      name: productInfo.name,
      details: productInfo.details,
      addedAt: new Date(),
    };

    setProducts((prev) => [...prev, newProduct]);
  };

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
      // Check if this is a product request
      if (isProductRequest(currentPrompt)) {
        const productName = extractProductName(currentPrompt);

        if (productName) {
          // Create a specific prompt for product information
          const productPrompt = `Provide brief product details for ${productName} including: name, category, key features, and approximate price. Format as: Name: [name], Category: [category], Features: [3-4 key features], Price: [price range]`;

          const aiResponse = await callGeminiAPI(productPrompt);

          if (
            !aiResponse.startsWith("Error:") &&
            !aiResponse.startsWith("API Error:") &&
            !aiResponse.startsWith("Network error:")
          ) {
            // Add product to the product list
            addProduct({
              name: productName,
              details: aiResponse,
            });

            // Add a chat message confirming the product was added
            const botMessage = {
              id: Date.now() + 1,
              type: "bot",
              content: `✅ Product "${productName}" has been added to your product list! Check the left panel for details.`,
              timestamp: new Date(),
            };
            setChatHistory((prev) => [...prev, botMessage]);
          } else {
            setError(aiResponse);
          }
        } else {
          // If we can't extract product name, ask for clarification
          const botMessage = {
            id: Date.now() + 1,
            type: "bot",
            content:
              "Please specify the product name you'd like me to add. For example: 'add product iPhone 15' or 'create product details for Samsung Galaxy'",
            timestamp: new Date(),
          };
          setChatHistory((prev) => [...prev, botMessage]);
        }
      } else {
        // Normal chat interaction
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

  const clearProducts = () => {
    setProducts([]);
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
                <div className="access-error">⚠️ {accessError}</div>
              )}

              <button type="submit" className="access-button">
                🚀 Access Chat
              </button>
            </form>

            <div className="access-footer">
              <p>🤖 Create by Abhishek Mishra</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Left Side - Product Container */}
      <div className="product-container">
        <div className="product-header">
          <h3>📦 Product Details</h3>
          <button
            onClick={clearProducts}
            className="clear-products-button"
            disabled={products.length === 0}
          >
            Clear All
          </button>
        </div>

        <div className="product-content">
          {products.length === 0 ? (
            <div className="no-products">
              <div className="no-products-icon">📦</div>
              <h4>No Products Added</h4>
              <p>Ask Gemini to add product details by saying:</p>
              <ul>
                <li>"Add product iPhone 15"</li>
                <li>"Create product details for Samsung Galaxy"</li>
                <li>"Product information for MacBook Pro"</li>
              </ul>
            </div>
          ) : (
            <div className="products-list">
              {products.map((product) => (
                <div key={product.id} className="product-item">
                  <div className="product-item-header">
                    <h4 className="product-name">{product.name}</h4>
                    <span className="product-time">
                      {product.addedAt.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="product-details">{product.details}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Chat Container */}
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
                  Start a conversation by typing your question below. I'm here
                  to help with:
                </p>
                <ul>
                  <li>Answering questions</li>
                  <li>Providing explanations</li>
                  <li>Creative writing</li>
                  <li>Problem solving</li>
                  <li>Adding product details</li>
                  <li>And much more!</li>
                </ul>
                <p>
                  <em>
                    Note: Responses are limited to 100 tokens for quick
                    interactions.
                  </em>
                </p>
                <div className="product-tip">
                  💡 <strong>Tip:</strong> Try saying "add product [product
                  name]" to add products to the left panel!
                </div>
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
                <div className="loading-main-text">
                  🤔 Generating response...
                </div>
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
              placeholder="Ask me anything or try 'add product [product name]' to add products to the left panel..."
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
    </div>
  );
}

export default GeminiChat;
