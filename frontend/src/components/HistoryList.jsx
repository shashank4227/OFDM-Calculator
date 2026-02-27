import React from 'react';

const HistoryList = ({ history, onSelect }) => {
  if (!history || history.length === 0) {
    return <div className="empty-state">No saved history.</div>;
  }

  return (
    <div className="history-list">
      {history.map((record) => {
          const date = new Date(record.createdAt);
          return (
            <div 
              key={record._id} 
              className="history-item"
              onClick={() => onSelect({...record.results, baseParams: record.parameters})}
            >
              <div className="history-header">
                <span>{record.parameters.fftSize} FFT | {record.parameters.dataPilotRatio ? `${record.parameters.dataPilotRatio} Ratio | ` : ''}{record.parameters.dataSubcarriers} SC | {record.parameters.bitsPerSymbol} bps</span>
                <span>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="history-stats">
                <div className="history-stat">
                  <span>Data Rate</span>
                  <span className="val">{record.results.dataRateMbps.toFixed(2)} M</span>
                </div>
                <div className="history-stat" style={{ color: '#10b981' }}>
                  <span>Throughput</span>
                  <span className="val">{record.results.macThroughputMbps.toFixed(2)} M</span>
                </div>
              </div>
            </div>
          );
      })}
    </div>
  );
};

export default HistoryList;
