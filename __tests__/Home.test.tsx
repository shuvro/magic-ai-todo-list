/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '../app/page';

// Mock the fetch function
global.fetch = jest.fn();

const mockFetchResponse = (data: any) => {
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(data),
  });
};

describe('Home Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    localStorage.clear();
    
    // Default mock implementation
    (global.fetch as jest.Mock).mockImplementation(() =>
      mockFetchResponse({
        content: JSON.stringify({
          action: 'create',
          item: 'test todo',
          response: 'Added "test todo" to your list'
        })
      })
    );
  });

  test('renders the main components', () => {
    render(<Home />);
    
    // Check for main headings
    expect(screen.getByText('AI Todo List')).toBeInTheDocument();
    expect(screen.getByText('Todo List')).toBeInTheDocument();
    expect(screen.getByText('Chat with AI')).toBeInTheDocument();
    
    // Check for input and button
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reset All' })).toBeInTheDocument();
  });

  test('shows empty state messages when no todos or chat history', () => {
    render(<Home />);
    
    expect(screen.getByText('No todos yet. Start chatting to add some!')).toBeInTheDocument();
    expect(screen.getByText('Start chatting to manage your todo list!')).toBeInTheDocument();
  });

  test('adds a todo when submitting a message', async () => {
    const user = userEvent.setup();
    render(<Home />);
    
    // Type a message and submit
    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button', { name: 'Send' });
    
    await user.type(input, 'Add test todo');
    await user.click(sendButton);
    
    // Check that fetch was called correctly
    expect(global.fetch).toHaveBeenCalledWith('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'Add test todo', todos: [] }),
    });
    
    // Wait for the todo to be added
    await waitFor(() => {
      expect(screen.getByText('test todo')).toBeInTheDocument();
    });
    
    // Check that chat history was updated
    expect(screen.getByText('You: Add test todo')).toBeInTheDocument();
    expect(screen.getByText('AI: Added "test todo" to your list')).toBeInTheDocument();
  });

  test('toggles todo completion when checkbox is clicked', async () => {
    const user = userEvent.setup();
    
    // Set up localStorage with a todo
    localStorage.setItem('todos', JSON.stringify([{ id: '1', text: 'existing todo', completed: false }]));
    
    render(<Home />);
    
    // Find the checkbox and click it
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    
    // Check that the todo is now marked as completed
    const todoText = screen.getByText('existing todo');
    expect(todoText.className).toContain('line-through');
  });

  test('clears todos and chat history when reset button is clicked', async () => {
    const user = userEvent.setup();
    
    // Set up localStorage with a todo and chat history
    localStorage.setItem('todos', JSON.stringify([{ id: '1', text: 'existing todo', completed: false }]));
    localStorage.setItem('chatHistory', JSON.stringify(['You: test', 'AI: response']));
    
    // Mock window.confirm to return true
    window.confirm = jest.fn().mockImplementation(() => true);
    
    render(<Home />);
    
    // Verify initial state
    expect(screen.getByText('existing todo')).toBeInTheDocument();
    expect(screen.getByText('You: test')).toBeInTheDocument();
    
    // Click the reset button
    const resetButton = screen.getByRole('button', { name: 'Reset All' });
    await user.click(resetButton);
    
    // Check that confirm was called
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to clear all todos and chat history?');
    
    // Check that todos and chat history were cleared
    expect(screen.queryByText('existing todo')).not.toBeInTheDocument();
    expect(screen.queryByText('You: test')).not.toBeInTheDocument();
    
    // Check that empty state messages are shown
    expect(screen.getByText('No todos yet. Start chatting to add some!')).toBeInTheDocument();
    expect(screen.getByText('Start chatting to manage your todo list!')).toBeInTheDocument();
  });
}); 