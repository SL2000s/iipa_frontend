import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { submitPrompt } from "./services/promptService";

function App() {
  const [input, setInput] = useState('');
  const [kb, setKb] = useState([]);  // Knowledge Base will be a list of premises or proofs   // TODO: remove
  const [chatHistory, setChatHistory] = useState([]);  // State to store chat history

  // Create a ref for the chat history container
  const chatHistoryRef = useRef(null);

  const chooseTactic = (tactic) => {
    if (tactic === 'verifyProof') {
      setInput('Given two statements p_i and p_j verify if the entailment between the two statements are logically consistent and sound by formally');
    } else if (tactic === 'expandAssumptions') {
      setInput('Given a statement p_i expand the implied definitions and assumptions by formally');
    }
    // TODO: Implement other tactics similarly
  };

  const handleSubmit = async () => {
    try {
      const response = await submitPrompt(input, chatHistory);  // Wait for the Promise to resolve
      setChatHistory([...chatHistory, { prompt: input, answer: response.answer }]);
      setInput('');
    } catch (error) {
      setChatHistory([...chatHistory, { prompt: input, answer: 'Error while processing the prompt.' }]);  // TODO: pop-up message instead of adding to history
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();  // Prevents default Enter behavior (new line)
      handleSubmit();  // Call the submit function
    }
  };

  const handleNewChat = () => {
    setChatHistory([]);
    setInput('');
  };

  const handleClearInput = () => {
    setInput(''); // Clear the input field
  };

  // Effect to scroll to the bottom of the chat history
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]); // Runs every time chatHistory changes

  return (
    <div className="app-container">
      <div className="title">
        <h1>Informal Interactive Proof Assistant</h1>
        <p>Enter your question to the proof assistent.</p>
      </div>
      <div className="chat-container">
        {/* Chat History */}
        <div className="chat-history" ref={chatHistoryRef}>
          <ul>
            {chatHistory.map((chat, index) => (
              <li key={index} className="chat-message">
                <div className="prompt-bubble">
                  <strong>You:</strong> {chat.prompt}
                </div>
                <div className="response-bubble">
                  <strong>Assistant:</strong> {chat.answer}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Input Area */}
        <div className="input-area">
          <textarea
            className="input-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your message..."
          />
          <button onClick={handleSubmit}>Send</button>
        </div>

        {/* Tactics Buttons */}
        <div className="command-menu">
          <div className="tactics-buttons">
            <button onClick={() => chooseTactic('verifyProof')}>Verify Proof</button>
            <button onClick={() => chooseTactic('expandAssumptions')}>Expand Assumptions</button>
            <button onClick={() => chooseTactic('prove')}>Prove Statement</button>
            <button onClick={() => chooseTactic('getPremises')}>Get Premises</button>
            <button onClick={() => chooseTactic('addToKB')}>Add to KB</button>
            {/* <button onClick={handleClearInput}>Clear</button> */}
          </div>
        </div>

        {/* New Chat Button */}
        {/* <div className="new-chat-button">
          <button onClick={handleNewChat}>New Chat</button>
        </div> */}
      </div>

      <div className="kb-viewer">
        <h3>Knowledge Base</h3>
        <ul>
          {kb.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
