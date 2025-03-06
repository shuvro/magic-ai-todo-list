'use client';

import { useState, useEffect } from 'react';

interface Todo {
  id: string;
  text: string;
  completed?: boolean;
}

export default function Home() {
  const [message, setMessage] = useState('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [chatHistory, setChatHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load todos from localStorage on initial render
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      try {
        setTodos(JSON.parse(savedTodos));
      } catch (error) {
        console.error('Error parsing saved todos:', error);
      }
    }
    
    const savedChatHistory = localStorage.getItem('chatHistory');
    if (savedChatHistory) {
      try {
        setChatHistory(JSON.parse(savedChatHistory));
      } catch (error) {
        console.error('Error parsing saved chat history:', error);
      }
    }
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);
  
  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, todos }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Parse the AI response first
      const aiResponse = JSON.parse(data.content);
      setChatHistory([...chatHistory, `You: ${message}`, `AI: ${aiResponse.response}`]);
      setMessage('');

      // Update todos accordingly
      try {
        switch (aiResponse.action) {
          case 'create':
            setTodos([...todos, { id: Date.now().toString(), text: aiResponse.item, completed: false }]);
            break;
          case 'delete':
            setTodos(todos.filter(todo => todo.text.toLowerCase() !== aiResponse.item.toLowerCase()));
            break;
          case 'update':
            setTodos(todos.map(todo => 
              todo.text.toLowerCase() === aiResponse.oldItem.toLowerCase()
                ? { ...todo, text: aiResponse.newItem }
                : todo
            ));
            break;
          case 'read':
            // No state change needed for read operations
            break;
          case 'toggle':
            setTodos(todos.map(todo => 
              todo.text.toLowerCase() === aiResponse.item.toLowerCase()
                ? { ...todo, completed: !todo.completed }
                : todo
            ));
            break;
        }
      } catch (error) {
        console.error('Error processing AI response:', error);
        setChatHistory([...chatHistory, 'AI: Sorry, I had trouble processing that request.']);
      }
    } catch (error) {
      console.error('Error:', error);
      setChatHistory([...chatHistory, 'AI: Sorry, there was an error processing your request.']);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTodoCompletion = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to clear all todos and chat history?')) {
      setTodos([]);
      setChatHistory([]);
      localStorage.removeItem('todos');
      localStorage.removeItem('chatHistory');
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-center">AI Todo List</h1>
          <button 
            onClick={handleReset}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Reset All
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Todo List */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Todo List</h2>
            {todos.length === 0 ? (
              <p className="text-gray-400">No todos yet. Start chatting to add some!</p>
            ) : (
              <ul className="space-y-3">
                {todos.map((todo) => (
                  <li 
                    key={todo.id} 
                    className="p-3 bg-gray-700 rounded-lg flex items-center justify-between hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={todo.completed} 
                        onChange={() => toggleTodoCompletion(todo.id)}
                        className="mr-3 h-5 w-5"
                      />
                      <span className={todo.completed ? "line-through text-gray-400" : ""}>
                        {todo.text}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Chat Interface */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col h-[500px]">
            <h2 className="text-2xl font-semibold mb-4">Chat with AI</h2>
            <div className="flex-grow overflow-y-auto mb-4 p-4 bg-gray-700 rounded-lg">
              {chatHistory.length === 0 ? (
                <p className="text-gray-400">Start chatting to manage your todo list!</p>
              ) : (
                chatHistory.map((message, index) => (
                  <div 
                    key={index} 
                    className={`mb-3 p-2 rounded-lg ${
                      message.startsWith('You:') 
                        ? 'bg-blue-600 ml-auto max-w-[80%]' 
                        : 'bg-gray-600 max-w-[80%]'
                    }`}
                  >
                    {message}
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type your message..."
                disabled={isLoading}
              />
              <button
                type="submit"
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
