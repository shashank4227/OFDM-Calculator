import React, { useState, useEffect } from 'react';
import { Activity, Clock, Database, Wifi } from 'lucide-react';
import CalculatorForm from './components/CalculatorForm';
import ResultsDisplay from './components/ResultsDisplay';
import HistoryList from './components/HistoryList';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  const [results, setResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/history`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleCalculate = async (params) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Calculation failed server-side');
      }

      const data = await response.json();
      setResults({...data.results, baseParams: data.parameters});
      fetchHistory(); // Refresh history after new calculation
    } catch (err) {
      setError(err.message || 'Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/history`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setHistory([]);
      }
    } catch (err) {
        console.error('Failed to clear history');
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1><Wifi size={36} style={{ display: 'inline', marginRight: '10px', verticalAlign: 'middle', color: '#3b82f6' }}/>OFDM Calculator</h1>
        <p className="subtitle">5G NR & LTE Subframe Parameters Optimizer</p>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="dashboard-grid">
        <div className="glass-panel form-section">
          <h2><Database size={24} color="#3b82f6" /> Input Parameters</h2>
          <CalculatorForm onCalculate={handleCalculate} isLoading={loading} />
        </div>

        <div className="results-history-section" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass-panel results-section">
            <h2><Activity size={24} color="#10b981" /> Computed Results</h2>
            <ResultsDisplay results={results} />
          </div>

          <div className="glass-panel history-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <h2 style={{ borderBottom: 'none', margin: 0, padding: 0 }}><Clock size={24} color="#8b5cf6" /> Calculation History</h2>
                {history.length > 0 && (
                    <button className="btn-secondary" onClick={handleClearHistory} style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>Clear All</button>
                )}
            </div>
            
            <HistoryList history={history} onSelect={setResults} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
