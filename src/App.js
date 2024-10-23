import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { submitPrompt } from "./services/promptService";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import ClipLoader from "react-spinners/ClipLoader";  

function App() {
  const [input, setInput] = useState('');
  const [kb, setKb] = useState(['lm_theory', 'number_theory', 'geometry']);  // List of KBs
  const [selectedKb, setSelectedKb] = useState('lm_theory');  // Active KB
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatHistoryRef = useRef(null);

  const chooseTactic = (tactic) => {
    if (tactic === 'verifyEntailment') {
      setInput('Verify that p_j follows from p_i.\n\np_i: UNDEFINED\np_j: UNDEFINED');
    } else if (tactic === 'expandAssumptions') {
      setInput('Expand the implied definitions and assumptions from p_i.\n\np_i: UNDEFINED');
    } else if (tactic === 'verifyStatement') {
      setInput('Is p_i correct?\n\np_i: UNDEFINED');
    } else if (tactic === 'prove') {
      setInput('Prove p_i.\n\np_i: UNDEFINED');
    } else if (tactic === 'proveWithinContext') {
      setInput('Prove p_i given the context P_i.\n\np_i: UNDEFINED\nP_i: UNDEFINED');
    } else if (tactic === 'premisesRetrieval') {
      setInput('Create a list of all premises related to s_i.\n\ns_i: UNDEFINED')
    }
  };

  const handleSubmit = async () => {
    if (input.trim() === "") return; 

    setIsLoading(true);  
    try {
      const response = await submitPrompt(input, chatHistory);  
      setChatHistory([...chatHistory, { prompt: input, answer: response.answer }]);
      setInput('');
    } catch (error) {
      setChatHistory([...chatHistory, { prompt: input, answer: 'Error while processing the prompt.' }]);
    }
    setIsLoading(false);  
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

  const handleKbSelect = (kbName) => {
    setSelectedKb(kbName);  // Update selected KB
  };

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]); 

  const preprocessLatex = (text) => {
    const blockProcessedContent = text.replace(
      /\\\[[\s\n]*(.*?)[\s\n]*\\\]/gs,
      (_, equation) => `\n$$${equation}$$\n`,
    );
    const inlineProcessedContent = blockProcessedContent.replace(
      /\\\((.*?)\\\)/gs,
      (_, equation) => `$${equation}$`,
    );
    return inlineProcessedContent;
  };

  return (
    <div className="app-container">
      
      {/* KB Viewer */}
      <div className="kb-viewer">
        {/* <h1><a href="/">IIPA</a></h1> */}
        <h3>Selected KB</h3>
        
          {kb.map((item, index) => (
            <p 
              key={index} 
              className={`kb-item ${selectedKb === item ? 'active' : ''}`} 
              onClick={() => handleKbSelect(item)}
            >
              {item}
            </p>
          ))}
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
            <button onClick={() => chooseTactic('expandAssumptions')} disabled={isLoading}>Get Assumptions</button>
            <button onClick={() => chooseTactic('prove')} disabled={isLoading}>Prove</button>
            <button onClick={() => chooseTactic('proveWithinContext')} disabled={isLoading}>Prove In Context</button>
            <button onClick={() => chooseTactic('premisesRetrieval')} disabled={isLoading}>Search Premises</button>
            <button onClick={() => chooseTactic('verifyEntailment')} disabled={isLoading}>Verify Entailment</button>
            <button onClick={() => chooseTactic('verifyStatement')} disabled={isLoading}>Verify Statement</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
