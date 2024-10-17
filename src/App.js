import React, { useState } from 'react';
import './App.css';
import { submitPrompt } from "./services/promptService";

function App() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [kb, setKb] = useState([]);  // Knowledge Base will be a list of premises or proofs

  const chooseTactic = (tactic) => {
    if (tactic === 'verifyProof') {
      setInput('Given two statements p_i and p_j verify if the entailment between the two statements are logically consistent and sound by formally');
    } else if (tactic === 'expandAssumptions') {
      setInput('Given a statement p_i expand the implied definitions and assumptions by formally');
    }
    // TODO: Implement other tactics similarly
  };

  const handleSubmit = async () => {
    setOutput('Processing prompt...');
    try {
      const response = await submitPrompt(input);  // Wait for the Promise to resolve
      setOutput(`Answer\n: ${response.answer}`);   // Access the `prompt` field from the response data
    } catch (error) {
      setOutput('Error while processing the prompt.');
    }
  };
  

  return (
    <div className="app-container">
      <div className="title">
        <h1>Informal Interactive Proof Assistant</h1>
        <p>Enter your statements and select a tactic to assist in your proof.</p>
      </div>
      <div className="main-panel">
        <div className="command-menu">
          <h3>Tactics</h3>
          <button onClick={() => chooseTactic('verifyProof')}>Verify Proof</button>
          <button onClick={() => chooseTactic('expandAssumptions')}>Expand Assumptions</button>
          <button onClick={() => chooseTactic('prove')}>Prove Statement</button>
          <button onClick={() => chooseTactic('getPremises')}>Get Premises</button>
          <button onClick={() => chooseTactic('addToKB')}>Add to KB</button>
        </div>
        <div className="dialogue-box">
          <textarea
            className="input-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter prompt"
          />
          <button onClick={handleSubmit}>Send</button>
          <div className="output-box">
            <h3>Output</h3>
            <p>{output}</p>
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
    </div>
  );
}

export default App;
