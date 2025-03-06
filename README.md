# AI-Powered Todo List

A Next.js application that allows users to manage a todo list through natural language conversations with an AI assistant.

## Features

- **Natural Language Todo Management**: Add, read, update, and delete todo items using conversational language
- **AI-Powered Interface**: Leverages OpenAI's GPT models to understand user intent
- **Persistent Storage**: Both todos and chat history are saved to localStorage so they persist between sessions
- **Responsive Design**: Works on both desktop and mobile devices
- **Task Completion Tracking**: Mark tasks as complete/incomplete
- **Comprehensive Test Suite**: Includes unit and integration tests for components and API

## CRUD Operations via Natural Language

- **Create**: "Add buy groceries to my list"
- **Read**: "Do I need to buy groceries?"
- **Update**: "Change buy groceries to buy organic groceries"
- **Delete**: "Remove buy groceries from my list"
- **Toggle**: "Mark buy groceries as done"

## Technical Implementation

- **Frontend**: Next.js with React and TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: OpenAI API
- **State Management**: React useState and useEffect hooks
- **Data Persistence**: localStorage

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env.local` file with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Testing

Run the test suite with:

```
npm test
```

Or run tests in watch mode during development:

```
npm run test:watch
```

The test suite includes:
- Component tests for the UI
- API route tests
- Integration tests for the complete flow

## Architecture

The application follows a simple architecture:

1. User inputs a message in the chat interface
2. The message is sent to the Next.js API route
3. The API route forwards the message to OpenAI with the current todo list context
4. OpenAI processes the message and returns a structured JSON response
5. The frontend parses the response and updates the UI accordingly

## Future Improvements

- Add user authentication
- Implement server-side storage (database)
- Add categories and priorities for todos
- Implement due dates and reminders
- Add voice input support
