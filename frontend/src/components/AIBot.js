import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AIBot.css';
import { toast } from 'react-toastify';
import ReactMarkdown from 'react-markdown';

const SUGGESTED_QUESTIONS = [
  "What are the best practices for learning a new programming language?",
  "How can I improve my productivity while coding?",
  "Explain the concept of machine learning in simple terms",
  "What are the latest trends in web development?",
  "How can I start learning artificial intelligence?"
];

// Function to format text with proper styling
const formatMessage = (text) => {
  // Replace markdown-style formatting with HTML
  let formattedText = text
    // Bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic text
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Lists
    .replace(/^\s*[-*+]\s+(.+)$/gm, '<li>$1</li>')
    // Headers
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  return formattedText;
};

// Component for rendering formatted message content
const MessageContent = ({ content }) => {
  const formattedContent = formatMessage(content);
  
  return (
    <div className="message-content-wrapper">
      <ReactMarkdown
        components={{
          // Style different elements
          p: ({ children }) => <p className="message-paragraph">{children}</p>,
          strong: ({ children }) => <strong className="message-bold">{children}</strong>,
          em: ({ children }) => <em className="message-italic">{children}</em>,
          code: ({ children, inline }) => 
            inline ? 
              <code className="message-inline-code">{children}</code> : 
              <pre className="message-code-block"><code>{children}</code></pre>,
          ul: ({ children }) => <ul className="message-list">{children}</ul>,
          ol: ({ children }) => <ol className="message-list">{children}</ol>,
          li: ({ children }) => <li className="message-list-item">{children}</li>,
          h1: ({ children }) => <h1 className="message-heading message-h1">{children}</h1>,
          h2: ({ children }) => <h2 className="message-heading message-h2">{children}</h2>,
          h3: ({ children }) => <h3 className="message-heading message-h3">{children}</h3>,
          a: ({ href, children }) => (
            <a 
              href={href} 
              className="message-link" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default function AIBot() {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const userId = localStorage.getItem('userId') || 'anonymous';
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const editInputRef = useRef(null);

  // Fetch user's chat history
  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      console.log('Fetching chats for userId:', userId);
      const response = await fetch(`http://localhost:4000/chats/${userId}`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        throw new Error(`Failed to fetch chats: ${response.status} ${errorData}`);
      }
      
      const data = await response.json();
      console.log('Received chats data:', data);
      setChats(data);
    } catch (err) {
      console.error('Detailed error fetching chats:', err);
      toast.error(err.message || 'Failed to load chat history');
    }
  };

  const fetchChat = async (chatId) => {
    try {
      const response = await fetch(`http://localhost:4000/chat/${chatId}`);
      if (!response.ok) throw new Error('Failed to fetch chat');
      const data = await response.json();
      setCurrentChat(data);
    } catch (err) {
      console.error('Error fetching chat:', err);
      toast.error('Failed to load chat');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  const handleNewChat = async () => {
    setCurrentChat(null);
    setMessage('');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    console.log('Sending message:', message);
    setLoading(true);
    try {
      const url = currentChat 
        ? `http://localhost:4000/chat/${currentChat._id}/message`
        : 'http://localhost:4000/chat';
      
      console.log('Sending request to:', url);
      console.log('Request payload:', {
        userId,
        message: message.trim()
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          userId,
          message: message.trim()
        })
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        throw new Error(`Failed to send message: ${response.status} ${errorData}`);
      }
      
      const data = await response.json();
      console.log('Received chat data:', data);
      
      setCurrentChat(data);
      if (!currentChat) {
        console.log('Fetching updated chat list...');
        fetchChats();
      }
      setMessage('');
    } catch (err) {
      console.error('Detailed error sending message:', err);
      toast.error(err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  // Add useEffect to log component state changes
  useEffect(() => {
    console.log('Current chat state:', currentChat);
    console.log('Current message state:', message);
    console.log('Current loading state:', loading);
  }, [currentChat, message, loading]);

  const handleDeleteChat = async (chatId) => {
    try {
      const response = await fetch(`http://localhost:4000/chat/${chatId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete chat');
      
      if (currentChat?._id === chatId) {
        setCurrentChat(null);
      }
      fetchChats();
      toast.success('Chat deleted successfully');
    } catch (err) {
      console.error('Error deleting chat:', err);
      toast.error('Failed to delete chat');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRenameChat = async (chatId, newTitle) => {
    try {
      const response = await fetch(`http://localhost:4000/chat/${chatId}/rename`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle })
      });

      if (!response.ok) {
        throw new Error('Failed to rename chat');
      }

      const updatedChat = await response.json();
      
      // Update the chats list
      setChats(chats.map(chat => 
        chat._id === chatId ? { ...chat, title: updatedChat.title } : chat
      ));

      // Update current chat if it's the one being renamed
      if (currentChat?._id === chatId) {
        setCurrentChat(updatedChat);
      }

      setEditingChatId(null);
      setEditingTitle('');
      toast.success('Chat renamed successfully');
    } catch (err) {
      console.error('Error renaming chat:', err);
      toast.error('Failed to rename chat');
    }
  };

  const startEditing = (chat) => {
    setEditingChatId(chat._id);
    setEditingTitle(chat.title);
    // Focus the input after it's rendered
    setTimeout(() => {
      editInputRef.current?.focus();
    }, 0);
  };

  const handleKeyPress = (e, chatId) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRenameChat(chatId, editingTitle);
    } else if (e.key === 'Escape') {
      setEditingChatId(null);
      setEditingTitle('');
    }
  };

  return (
    <div className="ai-bot-container">
      <div className="ai-bot-sidebar">
        <button className="new-chat-button" onClick={handleNewChat}>
          <i className="material-icons">add</i>
          New Chat
        </button>
        <div className="chat-history">
          {chats && chats.length > 0 ? (
            chats.map(chat => (
              <div 
                key={chat._id} 
                className={`chat-item ${currentChat?._id === chat._id ? 'active' : ''}`}
              >
                <div className="chat-item-content">
                  <i className="material-icons">chat</i>
                  {editingChatId === chat._id ? (
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => handleKeyPress(e, chat._id)}
                      onBlur={() => handleRenameChat(chat._id, editingTitle)}
                      className="chat-title-edit"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span 
                      className="chat-title"
                      onClick={() => fetchChat(chat._id)}
                    >
                      {chat.title}
                    </span>
                  )}
                  <span className="chat-date">{formatDate(chat.updatedAt)}</span>
                </div>
                <div className="chat-actions">
                  <button 
                    className="rename-chat-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(chat);
                    }}
                  >
                    <i className="material-icons">edit</i>
                  </button>
                  <button 
                    className="delete-chat-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChat(chat._id);
                    }}
                  >
                    <i className="material-icons">delete</i>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-chats-message">No previous chats</div>
          )}
        </div>
      </div>

      <div className="ai-bot-main">
        <div className="chat-container">
          {!currentChat ? (
            <div className="welcome-screen">
              <h1>Welcome to AI Assistant</h1>
              <p>Start a new conversation or select a previous chat</p>
              <div className="suggested-questions">
                <h3>Suggested Questions</h3>
                {SUGGESTED_QUESTIONS.map((question, index) => (
                  <button
                    key={index}
                    className="suggested-question"
                    onClick={() => {
                      setMessage(question);
                      handleSendMessage({ preventDefault: () => {} });
                    }}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="messages-container">
              {currentChat.messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}
                >
                  <div className="message-content">
                    <div className="message-header">
                      <i className="material-icons">
                        {msg.role === 'user' ? 'person' : 'smart_toy'}
                      </i>
                      <span>{msg.role === 'user' ? 'You' : 'AI Assistant'}</span>
                    </div>
                    <MessageContent content={msg.content} />
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          <form onSubmit={handleSendMessage} className="message-input-container">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={loading}
            />
            <button type="submit" disabled={loading || !message.trim()}>
              {loading ? (
                <i className="material-icons rotating">refresh</i>
              ) : (
                <i className="material-icons">send</i>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 