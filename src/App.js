import React, { useState, useEffect } from "react";
import { getTacticsStatus } from "./services/tacticsService";

function App() {
  const [tacticsStatus, setTacticsStatus] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const status = await getTacticsStatus();
      setTacticsStatus(status.status);
    };

    fetchData();
  }, []);

  return (
    <div className="App">
      <h1>Interactive Proof Assistant</h1>
      <h2>Tactics API Status: {tacticsStatus}</h2>
    </div>
  );
}

export default App;
