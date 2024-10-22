import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { submitPrompt } from "./services/promptService";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import ClipLoader from "react-spinners/ClipLoader";  // Import the ClipLoader spinner

function App() {
  const [input, setInput] = useState('');
  const [kb, setKb] = useState([]);  // Knowledge Base will be a list of premises or proofs
  const [chatHistory, setChatHistory] = useState([]);  // State to store chat history
  const [isLoading, setIsLoading] = useState(false);  // New state to track loading

  // Create a ref for the chat history container
  const chatHistoryRef = useRef(null);

  const chooseTactic = (tactic) => {
    if (tactic === 'verifyEntailment') {
      setInput('Verify that p_j follows from p_i.\n\np_i: UNDEFINED\np_j: UNDEFINED');
    } else if (tactic === 'expandAssumptions') {
      setInput('Expand the implied definitions and assumptions from p_i.\n\np_i: UNDEFINED');
    } else if (tactic === 'verifyStatement')
      setInput('Is p_i correct?\n\np_i: UNDEFINED');
      // TODO: Implement other tactics similarly
  };

  const handleSubmit = async () => {
    if (input.trim() === "") return; // Prevent empty submissions

    setIsLoading(true);  // Start loading before making API call
    try {
      const response = await submitPrompt(input, chatHistory);  // Wait for the Promise to resolve
      setChatHistory([...chatHistory, { prompt: input, answer: response.answer }]);
      setInput('');
    } catch (error) {
      setChatHistory([...chatHistory, { prompt: input, answer: 'Error while processing the prompt.' }]);  // TODO: pop-up message instead of adding to history
    }
    setIsLoading(false);  // Stop loading once the response is received or error occurs
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

  const preprocessLatex = (text) => {
    // Replace block-level LaTeX delimiters \[ \] with $$ $$
    const blockProcessedContent = text.replace(
      /\\n*\\\[\\n*(.*?)\\n*\\\]\\n*/gs,
      (_, equation) => `\n$$${equation}$$\n`,
    );
    // Replace inline LaTeX delimiters \( \) with $ $
    const inlineProcessedContent = blockProcessedContent.replace(
      /\\\((.*?)\\\)/gs,
      (_, equation) => `$${equation}$`,
    );
    return inlineProcessedContent;
  };

  return (
    <div className="app-container">
      <div className="title">
        <h1>Informal Interactive Proof Assistant</h1>
        <p>Enter your question to the proof assistant.</p>
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

        {/* Input Area */}
        <div className="input-area">
          <textarea
            className="input-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your message..."
            disabled={isLoading}  // Disable input while loading
          />
          <button onClick={handleSubmit} disabled={isLoading}>Send</button>
          {isLoading && (
              <div className="loading-spinner">
                <ClipLoader color={"#123abc"} loading={isLoading} size={50} />
              </div>
          )}
        </div>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="loading-spinner">
            <ClipLoader color={"#123abc"} loading={isLoading} size={50} />
          </div>
        )}

        {/* Tactics Buttons */}
        <div className="command-menu">
          <div className="tactics-buttons">
            <button onClick={() => chooseTactic('expandAssumptions')} disabled={isLoading}>Expand Assumptions</button>
            <button onClick={() => chooseTactic('verifyEntailment')} disabled={isLoading}>Verify Entailment</button>
            <button onClick={() => chooseTactic('verifyStatement')} disabled={isLoading}>Verify Statement</button>
          </div>
        </div>
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
