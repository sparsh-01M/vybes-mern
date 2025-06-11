const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Chat = require("../models/chat");
require('dotenv').config();

// Initialize Gemini API with latest version
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, {
  apiVersion: 'v1'  // Use v1 instead of v1beta
});

// Get all chats for a user
router.get("/chats/:userId", async (req, res) => {
  console.log('Fetching chats for user:', req.params.userId);
  try {
    const chats = await Chat.find({ userId: req.params.userId })
      .sort({ updatedAt: -1 })
      .select('title createdAt updatedAt');
    console.log('Found chats:', chats.length);
    res.json(chats);
  } catch (err) {
    console.error("Error fetching chats:", err);
    res.status(500).json({ error: "Error fetching chats" });
  }
});

// Get a specific chat with messages
router.get("/chat/:chatId", async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }
    res.json(chat);
  } catch (err) {
    console.error("Error fetching chat:", err);
    res.status(500).json({ error: "Error fetching chat" });
  }
});

// Get user statistics
router.get("/user/:userId/stats", async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get total message count across all chats for this user
    const stats = await Chat.aggregate([
      { $match: { userId: userId } },
      { $group: {
        _id: null,
        totalMessages: { $sum: "$messageCount" },
        totalChats: { $sum: 1 }
      }}
    ]);

    res.json({
      totalMessages: stats[0]?.totalMessages || 0,
      totalChats: stats[0]?.totalChats || 0
    });
  } catch (err) {
    console.error("Error fetching user stats:", err);
    res.status(500).json({ error: "Error fetching user statistics" });
  }
});

// Create a new chat
router.post("/chat", async (req, res) => {
  try {
    const { userId, message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Initialize chat model with specified version
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-preview-04-17",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });

    // Start a chat session
    const chat = model.startChat({
      history: [],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });

    // Send message and get response
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    // Save chat to database with correct userId field
    const dbChat = new Chat({
      userId,
      messages: [
        { role: 'user', content: message },
        { role: 'assistant', content: text }
      ],
      messageCount: 2,
      title: message.substring(0, 30) + (message.length > 30 ? '...' : '')
    });
    await dbChat.save();

    res.json(dbChat);
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ 
      error: "Failed to process chat request",
      details: error.message 
    });
  }
});

// Add message to existing chat
router.post("/chat/:chatId/message", async (req, res) => {
  console.log('Adding message to chat:', req.params.chatId);
  console.log('Message body:', req.body);
  
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "message is required" });
    }

    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      console.error('Chat not found:', req.params.chatId);
      return res.status(404).json({ error: "Chat not found" });
    }

    // Add user message and increment message count
    chat.messages.push({
      role: 'user',
      content: message
    });
    chat.messageCount += 1;

    try {
      // Initialize chat model with specified version
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash-preview-04-17",
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      });
      
      // Convert messages to API format (assistant -> model)
      const apiHistory = chat.messages.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : msg.role,
        parts: [{ text: msg.content }],
      }));

      // Start a chat session with converted history
      const aiChat = model.startChat({
        history: apiHistory,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      });
      
      // Send message and get response
      const result = await aiChat.sendMessage(message);
      const response = await result.response;
      const text = response.text();
      console.log('Received Gemini response:', text.substring(0, 100) + '...');

      // Add assistant's response (store as 'assistant' in our DB)
      chat.messages.push({
        role: 'assistant',
        content: text
      });
      chat.messageCount += 1;

      await chat.save();
      console.log('Updated chat with new messages');
      res.json(chat);
    } catch (geminiError) {
      console.error('Gemini API error:', geminiError);
      // Still save the user's message and count even if Gemini fails
      await chat.save();
      res.status(500).json({ 
        error: "Error getting AI response",
        chat: chat,
        details: geminiError.message
      });
    }
  } catch (err) {
    console.error("Error adding message:", err);
    res.status(500).json({ error: "Error adding message", details: err.message });
  }
});

// Delete a chat
router.delete("/chat/:chatId", async (req, res) => {
  try {
    await Chat.findByIdAndDelete(req.params.chatId);
    res.json({ message: "Chat deleted successfully" });
  } catch (err) {
    console.error("Error deleting chat:", err);
    res.status(500).json({ error: "Error deleting chat" });
  }
});

// Rename chat
router.put("/chat/:chatId/rename", async (req, res) => {
  try {
    const { chatId } = req.params;
    const { title } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: "Title is required" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    chat.title = title.trim();
    await chat.save();

    res.json(chat);
  } catch (err) {
    console.error("Error renaming chat:", err);
    res.status(500).json({ error: "Error renaming chat" });
  }
});

module.exports = router; 