# Gemini AI Chat Application

This is a React application that provides an AI-powered chat interface using Google's Gemini API, with a two-column layout featuring a product management system.

## Features

- 🤖 AI Chat powered by Google Gemini API
- 📦 Product details management
- 🔐 Access control with password protection
- 📱 Responsive design for mobile and desktop
- 💬 Persistent chat history
- ⚡ Real-time AI responses with 100 token limit

## Environment Setup

### 1. API Key Configuration

This application requires a Google Gemini API key. Follow these steps:

1. Get your API key from [Google AI Studio](https://aistudio.google.com/)
2. Copy `.env.example` to `.env` in the root directory
3. Add your actual API key and access key:

```bash
cp .env.example .env
```

Then edit `.env` with your actual values:

```bash
REACT_APP_GEMINI_API_KEY="your_gemini_api_key_here"
REACT_APP_ACCESS_KEY="your_access_key_here"
```

**Important**: Never commit your `.env` file to version control. It's already included in `.gitignore`.

### 2. Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

### 3. Access the Application

1. Open [http://localhost:3000/react-learning](http://localhost:3000/react-learning)
2. Enter the access key you configured in your `.env` file
3. Start chatting!

## Usage

### Chat Features

- Ask any questions for AI responses
- Use natural language for conversations
- Responses are limited to 100 tokens for quick interactions

### Product Management

Add products to the left panel using commands like:

- "add product iPhone 15"
- "create product details for Samsung Galaxy"
- "product information for MacBook Pro"

The AI will automatically generate and display product details in the left panel.

## Available Scripts

### `npm start`

Runs the app in development mode.
Open [http://localhost:3000/react-learning](http://localhost:3000/react-learning) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
