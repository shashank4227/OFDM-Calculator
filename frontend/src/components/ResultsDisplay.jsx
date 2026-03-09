import React from 'react';
import SubcarrierDiagram from './SubcarrierDiagram';

const ResultsDisplay = ({ results }) => {
  if (!results) {
    return (
      <div className="empty-state">
        <p>No calculations performed yet.</p>
        <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Fill out the parameters and click calculate to see the timing and throughput analytics.</p>
      </div>
    );
  }

  const tcpSec = results.derivedParams?.cpSizeSamples / results.baseParams?.samplingRate;
  const maxDelaySpreadSec = results.delaySpread; // we set this to TCP in the backend

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* CP vs Delay Spread Alert */}
      {results.derivedParams && results.delaySpread !== undefined && (
        <div style={{
          padding: '1rem',
          borderRadius: '8px',
          borderLeft: `4px solid #10b981`,
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          color: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginTop: '1rem'
        }}>
          <span style={{ fontSize: '1.25rem' }}>ℹ️</span>
          <div>
            <strong>Delay Spread: </strong>
            To prevent Inter-Symbol Interference (ISI), the maximum delay spread of the channel allowed is equal to the TCP (Cyclic Prefix Time).
            <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
              TCP (Max Delay Spread): {(tcpSec * 1e6).toFixed(2)} µs
            </div>
          </div>
        </div>
      )}
      
      {/* Derived Input Parameters */}
      {results.derivedParams && (
        <div className="explanation" style={{ marginTop: 0 }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#3b82f6' }}>⚡</span> Derived System Parameters
          </h3>
          <div className="explanation-row">
            <span>CP Size:</span>
            <span>{results.baseParams?.fftSize} / 4 = {results.derivedParams.cpSizeSamples} samples</span>
          </div>
          <div className="explanation-row">
            <span>Subcarriers:</span>
            <span>{results.derivedParams.dataSubcarriers} Data | {results.derivedParams.pilotSubcarriers} Pilot | {results.derivedParams.dcSubcarriers} DC | {results.derivedParams.nullSubcarriers} Null</span>
          </div>
          <div className="explanation-row">
            <span>Data Symbols / Subframe:</span>
            <span>{results.totalSymbolsPerSubframe} - {results.baseParams?.silenceSymbols} = {results.derivedParams.dataSymbols} symbols</span>
          </div>
          <div className="explanation-row">
            <span>Modulation Mapping:</span>
            <span>{results.baseParams?.modulation} &rarr; {results.derivedParams.bitsPerSymbol} bits / symbol</span>
          </div>
        </div>
      )}

      <div className="results-grid">
        <div className="result-card">
          <span className="result-label">Total Symbol Length</span>
          <div>
            <span className="result-value">{results.totalSymbolLength.toLocaleString()}</span>
            <span className="result-unit">samples</span>
          </div>
        </div>

        <div className="result-card">
          <span className="result-label">Symbol Duration</span>
          <div>
            <span className="result-value">{results.symbolDurationUs.toFixed(4)}</span>
            <span className="result-unit">µs</span>
          </div>
        </div>

        <div className="result-card">
          <span className="result-label">Symbols / Subframe</span>
          <div>
            <span className="result-value">{results.totalSymbolsPerSubframe}</span>
            <span className="result-unit">symbols</span>
          </div>
        </div>

        <div className="result-card highlight">
          <span className="result-label">Data REs / Subframe</span>
          <div>
            <span className="result-value">{results.dataResPerSubframe.toLocaleString()}</span>
            <span className="result-unit">REs</span>
          </div>
        </div>

        <div className="result-card highlight">
          <span className="result-label">Bits / Subframe</span>
          <div>
            <span className="result-value">{results.totalBitsPerSubframe.toLocaleString()}</span>
            <span className="result-unit">bits</span>
          </div>
        </div>

        <div className="result-card highlight">
          <span className="result-label">Raw Data Rate</span>
          <div>
            <span className="result-value">{results.dataRateMbps.toFixed(2)}</span>
            <span className="result-unit">Mbps</span>
          </div>
        </div>
        <div className="result-card highlight">
          <span className="result-label">Occupied Bandwidth</span>
          <div>
            <span className="result-value">{results.occupiedBandwidthMHz?.toFixed(2) || '0.00'}</span>
            <span className="result-unit">MHz</span>
          </div>
        </div>
        

        
        <div className="result-card highlight" style={{ gridColumn: '1 / -1', background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
          <span className="result-label" style={{ color: '#6ee7b7' }}>MAC Throughput (After FEC)</span>
          <div>
            <span className="result-value" style={{ color: '#10b981', fontSize: '2rem' }}>{results.macThroughputMbps.toFixed(2)}</span>
            <span className="result-unit" style={{ color: '#6ee7b7' }}>Mbps</span>
          </div>
        </div>
      </div>

      <div className="explanation">
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#f8fafc' }}>Step-by-Step Breakdown</h3>
        <div className="explanation-row">
          <span>OFDM Symbol Timing:</span>
          <span>({results.baseParams?.fftSize} + {results.derivedParams?.cpSizeSamples}) samples / {(results.baseParams?.samplingRate / 1000000).toFixed(2)}M = {results.symbolDurationUs.toFixed(4)} µs</span>
        </div>
        <div className="explanation-row">
          <span>Subframe Length:</span>
          <span>{(results.baseParams?.samplingRate / 1000000).toFixed(2)}M / 1000 = {results.derivedParams?.subframeLengthSamples.toLocaleString()} samples</span>
        </div>
        <div className="explanation-row">
          <span>Symbols / Subframe:</span>
          <span>{results.derivedParams?.subframeLengthSamples.toLocaleString()} samples / {results.totalSymbolLength.toLocaleString()} samples = {results.totalSymbolsPerSubframe} symbols</span>
        </div>
        <div className="explanation-row">
          <span>Resource Elements:</span>
          <span>{results.derivedParams?.dataSubcarriers} Data SC × {results.derivedParams?.dataSymbols} Data Sym = {results.dataResPerSubframe.toLocaleString()} REs</span>
        </div>
        <div className="explanation-row">
          <span>Total Bits:</span>
          <span>{results.dataResPerSubframe.toLocaleString()} REs × {results.derivedParams?.bitsPerSymbol} ({results.baseParams?.modulation}) = {results.totalBitsPerSubframe.toLocaleString()} bits</span>
        </div>
        <div className="explanation-row">
          <span>Data Rate:</span>
          <span>{results.totalBitsPerSubframe.toLocaleString()} bits / {results.subframeDurationMs} ms = {results.dataRateMbps.toFixed(2)} Mbps</span>
        </div>
        <div className="explanation-row">
          <span>Occupied Bandwidth:</span>
          <span>({results.derivedParams?.dataSubcarriers} + {results.derivedParams?.pilotSubcarriers} + {results.derivedParams?.dcSubcarriers}) Used SC × {(results.baseParams?.subcarrierSpacing / 1000).toFixed(0)} kHz = {results.occupiedBandwidthMHz?.toFixed(2) || '0.00'} MHz</span>
        </div>
        <div className="explanation-row">
          <span>TCP (Max Delay Spread):</span>
          <span>{results.derivedParams?.cpSizeSamples} samples / {(results.baseParams?.samplingRate / 1000000).toFixed(2)} MHz = {(tcpSec * 1e6).toFixed(2)} µs</span>
        </div>
        <div className="explanation-row" style={{ fontWeight: '600', color: '#f8fafc' }}>
          <span>Throughput:</span>
          <span>{results.dataRateMbps.toFixed(2)} Mbps × {results.baseParams?.fecRate} FEC = {results.macThroughputMbps.toFixed(2)} Mbps</span>
        </div>
      </div>

      <SubcarrierDiagram results={results} />
    </div>
  );
};

export default ResultsDisplay;
