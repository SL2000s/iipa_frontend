import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { submitPrompt } from "./services/promptService";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import ClipLoader from "react-spinners/ClipLoader";  

function App() {
  const [input, setInput] = useState('');
  
  // Update KB to hold both label, displayName, and link (if needed)
  const [kb, setKb] = useState([
    { label: 'lm_theory', displayName: 'LM Theory', link: 'http://127.0.0.1:8800' },
    { label: 'number_theory', displayName: 'Number Theory', link: '' },
    { label: 'geometry', displayName: 'Geometry', link: '' }
  ]);
  
  const [selectedKb, setSelectedKb] = useState('lm_theory');  // Active KB label
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatHistoryRef = useRef(null);

  // KB descriptions
  const kbDescriptions = {
    lm_theory: "LM Theory is a KB that focuses mathematical statements (definitions, axioms, lemmas, theorems, corollaries) about language models.",
    number_theory: "This KB is not implemented yet.",
    geometry: "This KB is not implemented yet."
  };

  const chooseTactic = (tactic) => {
    // same chooseTactic logic
  };

  const handleSubmit = async () => {
    // same handleSubmit logic
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();  
      handleSubmit();  
    }
  };

  const handleNewChat = () => {
    setChatHistory([]);
    setInput('');
  };

  const handleClearInput = () => {
    setInput('');
  };

  const handleKbSelect = (kbLabel) => {
    setSelectedKb(kbLabel);  // Update selected KB to the actual label
  };

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const preprocessLatex = (text) => {
    // same preprocessLatex logic
  };

  return (
    <div className="app-container">
      
      {/* KB Viewer */}
      <div className="kb-viewer">
        <h3>Select KB</h3>
        
        {kb.map((item, index) => (
          <p 
            key={index} 
            className={`kb-item ${selectedKb === item.label ? 'active' : ''}`} 
            onClick={() => handleKbSelect(item.label)}  // Send actual label
          >
            {item.displayName}  {/* Display user-friendly name */}
            {item.link && (
              <a href={item.link} target="_blank" rel="noopener noreferrer">
                <i className="fas fa-external-link-alt" style={{ marginLeft: '10px' }}></i>
              </a>
            )}
          </p>
        ))}

        {/* KB Description */}
        <div className="kb-description">
          <p><i>{kbDescriptions[selectedKb]}</i></p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-container">
        <div className="title">
          <h1>Informal Interactive Proof Assistant</h1>
        </div>

        <div className="chat-history" ref={chatHistoryRef}>
          <ul>
            {chatHistory.map((chat, index) => (
              <li key={index} className="chat-message">
                <div className="prompt-bubble">
                  <strong>You:</strong> {chat.prompt}
                </div>
                <div className="response-bubble">
                  <strong>Assistant:</strong>
                  <ReactMarkdown 
                    remarkPlugins={[remarkMath]} 
                    rehypePlugins={[rehypeKatex]}
                  >
                    {preprocessLatex(chat.answer)}
                  </ReactMarkdown>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="input-area">
          <textarea
            className="input-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your message..."
            disabled={isLoading}  
          />
          <button onClick={handleSubmit} disabled={isLoading}>Send</button>
          {isLoading && (
            <div className="loading-spinner">
              <ClipLoader color={"#123abc"} loading={isLoading} size={50} />
            </div>
          )}
        </div>

        <div className="command-menu">
          <div className="tactics-buttons">
            {/* Same tactics buttons */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
