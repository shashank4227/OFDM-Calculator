import React, { useState } from 'react';
import { Send } from 'lucide-react';

const defaultParams = {
  fftSize: 256,
  samplingRate: 30720000, 
  subcarrierSpacing: 120000,
  silenceSymbols: 25,
  dataPilotRatio: '3:1',
  modulation: 'QPSK', // 'BPSK', 'QPSK', '16QAM', '64QAM', '256QAM'
  fecRate: 0.5
};

const CalculatorForm = ({ onCalculate, isLoading }) => {
  const [params, setParams] = useState(defaultParams);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const stringFields = ['modulation', 'dataPilotRatio'];
    setParams({
      ...params,
      [name]: stringFields.includes(name) ? value : (parseFloat(value) || 0)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (params.subcarrierSpacing >= params.samplingRate) {
      alert("Subcarrier Spacing must be smaller than Sampling Rate.");
      return;
    }
    onCalculate(params);
  };

  const handleReset = () => {
    setParams(defaultParams);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-group">
          <label>FFT Size</label>
          <select 
            name="fftSize" 
            value={params.fftSize} 
            onChange={handleChange} 
            required
            style={{ 
              background: 'rgba(15, 23, 42, 0.6)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '8px', 
              padding: '0.75rem', 
              color: 'var(--text-primary)' 
            }}
          >
            {[4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Sampling Rate (Hz)</label>
          <input type="number" name="samplingRate" value={params.samplingRate} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Subcarrier Spacing (Hz)</label>
          <input type="number" name="subcarrierSpacing" value={params.subcarrierSpacing} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Silence Symbols / Subframe</label>
          <input type="number" name="silenceSymbols" value={params.silenceSymbols} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Data:Pilot Ratio</label>
          <select 
            name="dataPilotRatio" 
            value={params.dataPilotRatio} 
            onChange={handleChange} 
            required
            style={{ 
              background: 'rgba(15, 23, 42, 0.6)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '8px', 
              padding: '0.75rem', 
              color: 'var(--text-primary)' 
            }}
          >
            <option value="3:1">3:1</option>
            <option value="4:1">4:1</option>
            <option value="5:1">5:1</option>
          </select>
        </div>
        <div className="form-group">
          <label>Modulation</label>
          <select 
            name="modulation" 
            value={params.modulation} 
            onChange={handleChange} 
            required
            style={{ 
              background: 'rgba(15, 23, 42, 0.6)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '8px', 
              padding: '0.75rem', 
              color: 'var(--text-primary)' 
            }}
          >
            <option value="BPSK">BPSK (1 bit)</option>
            <option value="QPSK">QPSK (2 bits)</option>
            <option value="16QAM">16-QAM (4 bits)</option>
            <option value="64QAM">64-QAM (6 bits)</option>
            <option value="256QAM">256-QAM (8 bits)</option>
          </select>
        </div>
        <div className="form-group">
          <label>FEC Rate</label>
          <input type="number" name="fecRate" step="0.1" min={0} max={1} value={params.fecRate} onChange={handleChange} required />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button type="button" className="btn-secondary" onClick={handleReset} style={{ flex: 1, padding: '0.875rem' }}>
          Reset Default
        </button>
        <button type="submit" className="btn-primary" disabled={isLoading} style={{ flex: 2, margin: 0 }}>
          {isLoading ? <span className="loader"></span> : <><Send size={18} /> Calculate Performance</>}
        </button>
      </div>
    </form>
  );
};

export default CalculatorForm;
