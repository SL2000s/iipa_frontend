import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { submitPrompt } from "./services/promptService";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import ClipLoader from "react-spinners/ClipLoader";  

function App() {
  const [input, setInput] = useState('');
  
  // Update KB to hold both label and displayName
  const [kb, setKb] = useState([
    { label: 'lm_theory', displayName: 'LM Theory' },
    { label: 'number_theory', displayName: 'Number Theory' },
    { label: 'geometry', displayName: 'Geometry' }
  ]);
  
  const [selectedKb, setSelectedKb] = useState('lm_theory');  // Active KB label
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatHistoryRef = useRef(null);

  // KB descriptions
  const kbDescriptions = {
    lm_theory: "LM Theory is a KB that focuses mathematical statemtents (definitions, axioms, lemmas, theorems, corollaries) about language models.",
    number_theory: "This KB is not implemented yet.",
    geometry: "This KB is not implemented yet."
  };

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
      setInput('Create a list of all premises related to s_i.\n\ns_i: UNDEFINED');
    }
  };

  const handleSubmit = async () => {
    if (input.trim() === "") return; 

    setIsLoading(true);  
    try {
      const response = await submitPrompt(input, chatHistory, selectedKb);  // Send the actual kb label
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

  const handleKbSelect = (kbLabel) => {
    setSelectedKb(kbLabel);  // Update selected KB to the actual label
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
        <h3>Select KB</h3>
        
        {kb.map((item, index) => (
          <p 
            key={index} 
            className={`kb-item ${selectedKb === item.label ? 'active' : ''}`} 
            onClick={() => handleKbSelect(item.label)}  // Send actual label
          >
            {item.displayName}  {/* Display user-friendly name */}
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
