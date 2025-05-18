import React from 'react';
import { Link } from 'react-router-dom';
import './SpecialPages.css';

export default function AIBotPage() {
  return (
    <div className="special-page-container">
      <h1 className="page-title">
        <i className="material-icons">smart_toy</i>
        Vybes AI Assistant
      </h1>
      <div className="ai-content">
        <div className="chat-interface">
          <div className="chat-messages">
            <div className="bot-message">
              <p>Hello! I'm your Vybes AI assistant. How can I help you today?</p>
            </div>
          </div>
          <div className="chat-input">
            <input type="text" placeholder="Type your message here..." />
            <button className="send-button">
              <i className="material-icons">send</i>
            </button>
          </div>
        </div>
        <div className="ai-features">
          <h3>Available Features:</h3>
          <ul>
            <li><i className="material-icons">help</i> Content Recommendations</li>
            <li><i className="material-icons">psychology</i> Mental Health Support</li>
            <li><i className="material-icons">forum</i> Community Guidance</li>
          </ul>
        </div>
      </div>
    </div>
  );
}