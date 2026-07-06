import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';
import { sendChatMessage } from '../services/gemini';

export default function CopilotChat({ apiKey, hasApiKey, onOpenKeyModal }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your virtual Grid Engineering Advisor. Ask me anything about power dispatch optimization, renewable energy mix integration, load shedding formulas, or battery storage policies.'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const samplePrompts = [
    'How do we handle thermal capacity overloads?',
    'Explain how weather affects battery discharge strategy.',
    'Recommend residential demand response policies.'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (text) => {
    const messageToSend = text || inputValue;
    if (!messageToSend.trim()) return;

    if (!hasApiKey) {
      onOpenKeyModal();
      return;
    }

    const newUserMessage = { role: 'user', content: messageToSend };
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const chatHistory = [...messages];
      const reply = await sendChatMessage(apiKey, chatHistory, messageToSend);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `⚠️ Failed to get recommendation from Gemini: ${err.message || 'Check your internet connection or API key.'}` 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="panel-container" style={{ height: '100%' }}>
      <div className="panel-header">
        <h2 className="panel-title">
          <MessageSquare size={20} className="text-accent-cyan" />
          Grid AI Advisor
        </h2>
      </div>

      <div className="chat-container">
        {/* Chat History */}
        <div className="chat-history">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.role}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                {msg.role === 'user' ? 'OPERATOR' : 'GRID PULSE ADVISOR'}
              </div>
              <div 
                className="markdown-body"
                dangerouslySetInnerHTML={{ 
                  __html: msg.content
                    .replace(/\n/g, '<br/>')
                    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                    .replace(/- (.*)/g, '<li>$1</li>')
                }} 
              />
            </div>
          ))}
          {loading && (
            <div className="chat-message assistant">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', fontWeight: 600 }}>
                GRID PULSE ADVISOR
              </div>
              <div className="loading-container">
                <span className="pulse-loader"></span>
                <span className="pulse-loader"></span>
                <span className="pulse-loader"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length === 1 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '0 16px 12px 16px' }}>
            {samplePrompts.map((prompt, i) => (
              <button
                key={i}
                className="btn btn-secondary"
                style={{ fontSize: '11px', padding: '6px 10px', borderRadius: '20px' }}
                onClick={() => handleSendMessage(prompt)}
                disabled={loading}
              >
                <Sparkles size={10} className="text-accent-cyan" />
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Chat input */}
        <div className="chat-input-bar">
          <input
            type="text"
            className="chat-input"
            placeholder={hasApiKey ? "Ask about grid operations, dispatch strategies, curtailment..." : "Configure API key to chat..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={loading || !hasApiKey}
          />
          <button
            className="btn btn-primary"
            style={{ padding: '12px' }}
            onClick={() => handleSendMessage()}
            disabled={loading || !inputValue.trim() || !hasApiKey}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
