import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { submitPrompt } from "./services/promptService";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import ClipLoader from "react-spinners/ClipLoader";  
import { FaCopy } from "react-icons/fa";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faEnvelope, faArrowRight, faComment } from '@fortawesome/free-solid-svg-icons';

function App() {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);
  const [kb, setKb] = useState([
    { label: 'lm_theory', displayName: 'LM Theory', link: 'http://127.0.0.1:8800' },
    { label: 'number_theory', displayName: 'Number Theory', link: '' },
    { label: 'geometry', displayName: 'Geometry', link: '' }
  ]);
  
  const [selectedKb, setSelectedKb] = useState('lm_theory');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatHistoryRef = useRef(null);

  const kbDescriptions = {
    lm_theory: "LM Theory is a KB that focuses mathematical statements (definitions, axioms, lemmas, theorems, corollaries) about language models.",
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
      const response = await submitPrompt(input, chatHistory, selectedKb);
      setChatHistory([...chatHistory, { prompt: input, answer: response.answer, latexMacros: response.latex_macros }]);
      setInput('');
    } catch (error) {
      setChatHistory([...chatHistory, { prompt: input, answer: 'Error while processing the prompt.', latexMacros: {} }]);
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
    setSelectedKb(kbLabel);
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const preprocessLatex = (text) => {
    const blockProcessedContent = text.replace(
      /\\\[[\s\n]*(.*?)[\s\n]*\\\]/gs,
      (_, equation) => `\n$$\n${equation}\n$$\n`,
    );
    const inlineProcessedContent = blockProcessedContent.replace(
      /\\\((.*?)\\\)/gs,
      (_, equation) => `$${equation}$`,
    );
    return inlineProcessedContent;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Response copied to clipboard!");
  };

  return (
    <div className="app-container">
      
      <div className="kb-viewer">
        <h3>Select KB</h3>
        
        {kb.map((item, index) => (
          <p 
            key={index} 
            className={`kb-item ${selectedKb === item.label ? 'active' : ''}`} 
            onClick={() => handleKbSelect(item.label)}
          >
            {item.displayName}
            {item.link && (
              <a href={item.link} target="_blank" rel="noopener noreferrer">
                <i className="fas fa-external-link-alt" style={{ marginLeft: '10px' }}></i>
              </a>
            )}
          </p>
        ))}

        <div className="kb-description">
          <p><i>{kbDescriptions[selectedKb]}</i></p>
        </div>
      </div>

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
                    rehypePlugins={[[rehypeKatex, { macros: chat.latexMacros || {} }]]}
                  >
                    {preprocessLatex(chat.answer)}
                  </ReactMarkdown>
                  {/* Copy Icon for each response */}
                  <FaCopy
                    className="copy-icon"
                    onClick={() => copyToClipboard(chat.answer)}
                    title="Copy to clipboard"
                    style={{ cursor: 'pointer', fontSize: '1.2em', marginTop: '8px' }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="input-area">
          <div className="input-wrapper">
            <textarea
              ref={inputRef}
              className="input-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your message..."
              disabled={isLoading}
            />
            <button className="send-button" onClick={handleSubmit} disabled={isLoading}>
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>
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
