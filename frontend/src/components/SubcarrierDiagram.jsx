import React, { useMemo } from 'react';

const SubcarrierDiagram = ({ results }) => {
  const { baseParams, derivedParams } = results || {};

  const carriers = useMemo(() => {
    if (!baseParams || !derivedParams) return [];
    
    const n = baseParams.fftSize;
    if (n > 8192) return []; // Safety limit to avoid rendering massive SVGs

    const nulls = derivedParams.nullSubcarriers;
    const leftGuard = Math.floor(nulls / 2);
    const rightGuard = Math.ceil(nulls / 2);

    const tempCarriers = [];
    for (let i = -n / 2; i < n / 2; i++) {
      if (i === 0) {
        tempCarriers.push({ index: i, type: 'dc' });
      } else if (i < -n / 2 + leftGuard || i >= n / 2 - rightGuard) {
        tempCarriers.push({ index: i, type: 'null' });
      } else {
        tempCarriers.push({ index: i, type: 'usable' });
      }
    }

    const usable = tempCarriers.filter(c => c.type === 'usable');
    const pilotCount = derivedParams.pilotSubcarriers;

    // Distribute pilots evenly among usable subcarriers
    for (let i = 0; i < pilotCount; i++) {
      const idx = Math.floor((i * usable.length) / pilotCount);
      if (usable[idx]) {
        usable[idx].type = 'pilot';
      }
    }
    
    // Assign remainder to data
    tempCarriers.forEach(c => {
      if (c.type === 'usable') c.type = 'data';
    });

    return tempCarriers;
  }, [baseParams, derivedParams]);

  if (!carriers.length) return null;

  const width = 1000;
  const height = 300;
  const paddingX = 40;
  const baseY = 220;
  const maxAmplitude = 120;
  
  const usableWidth = width - paddingX * 2;
  const spacing = usableWidth / Math.max(1, carriers.length - 1);

  const getStyle = (type) => {
    switch (type) {
      case 'data': return { color: '#10b981', h: maxAmplitude, stroke: 1.5, opacity: 0.8 };
      case 'pilot': return { color: '#3b82f6', h: maxAmplitude + 20, stroke: 2, opacity: 1 };
      case 'null': return { color: '#94a3b8', h: 30, stroke: 1, opacity: 0.5, dashArray: "2,2" };
      case 'dc': return { color: '#ef4444', h: 0, stroke: 2, opacity: 1 };
      default: return { color: '#000', h: 0, stroke: 1, opacity: 1 };
    }
  };

  return (
    <div className="explanation" style={{ marginTop: '0', background: 'rgba(30, 41, 59, 0.4)' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ color: '#38bdf8' }}>📈</span> Subcarrier Allocation (Frequency Domain)
      </h3>
      
      <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', overflowX: 'auto', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', minWidth: '700px', height: 'auto', display: 'block' }}>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#1e293b" />
            </marker>
          </defs>

          {/* Axes */}
          <line x1={paddingX / 2} y1={baseY} x2={width - paddingX / 2} y2={baseY} stroke="#1e293b" strokeWidth="2" markerEnd="url(#arrow)" />
          <text x={width - paddingX / 2} y={baseY - 10} fontSize="13" fontWeight="bold" fill="#1e293b" textAnchor="end">Frequency</text>
          
          <line x1={width / 2} y1={baseY} x2={width / 2} y2={40} stroke="#1e293b" strokeWidth="2" markerEnd="url(#arrow)" />
          <text x={width / 2 + 10} y={50} fontSize="13" fontWeight="bold" fill="#1e293b">Amplitude</text>

          {/* Dynamic Subcarriers */}
          {carriers.map((c, idx) => {
            const x = paddingX + idx * spacing;
            const style = getStyle(c.type);
            
            return (
              <g key={`carrier-${c.index}`}>
                {style.h > 0 && (
                  <line 
                    x1={x} 
                    y1={baseY} 
                    x2={x} 
                    y2={baseY - style.h} 
                    stroke={style.color} 
                    strokeWidth={style.stroke}
                    strokeDasharray={style.dashArray || ""}
                    opacity={style.opacity}
                  />
                )}
                {c.type === 'dc' && (
                  <circle cx={x} cy={baseY} r="4" fill={style.color} />
                )}
                {c.type === 'null' && (
                  <circle cx={x} cy={baseY - style.h} r="2" fill={style.color} opacity={0.6} />
                )}
              </g>
            );
          })}

          {/* X Axis Center & Edge Labels */}
          <text x={width / 2} y={baseY + 22} fontSize="13" fontWeight="bold" fill="#ef4444" textAnchor="middle">0 (DC)</text>
          <text x={paddingX} y={baseY + 22} fontSize="13" fontWeight="bold" fill="#64748b" textAnchor="middle">-N/2</text>
          <text x={width - paddingX} y={baseY + 22} fontSize="13" fontWeight="bold" fill="#64748b" textAnchor="middle">+N/2</text>
          
          {/* Side Half Brackets */}
          <path d={`M ${paddingX} ${baseY + 40} L ${paddingX} ${baseY + 50} L ${width / 2 - 15} ${baseY + 50} L ${width / 2 - 15} ${baseY + 40}`} fill="none" stroke="#94a3b8" strokeWidth="1.5" />
          <text x={(paddingX + width / 2) / 2} y={baseY + 65} fontSize="12" fontWeight="bold" fill="#64748b" textAnchor="middle">Left Side Half</text>

          <path d={`M ${width / 2 + 15} ${baseY + 40} L ${width / 2 + 15} ${baseY + 50} L ${width - paddingX} ${baseY + 50} L ${width - paddingX} ${baseY + 40}`} fill="none" stroke="#94a3b8" strokeWidth="1.5" />
          <text x={(width / 2 + width - paddingX) / 2} y={baseY + 65} fontSize="12" fontWeight="bold" fill="#64748b" textAnchor="middle">Right Side Half</text>
          
          {/* Legend Box */}
          <g transform={`translate(${paddingX + 10}, 15)`}>
            <rect x="0" y="0" width="170" height="100" fill="#ffffff" stroke="#e2e8f0" rx="4" />
            <line x1="15" y1="20" x2="35" y2="20" stroke="#10b981" strokeWidth="2" />
            <text x="45" y="24" fontSize="12" fill="#334155">Data Carrier</text>
            
            <line x1="15" y1="42" x2="35" y2="42" stroke="#3b82f6" strokeWidth="2" />
            <text x="45" y="46" fontSize="12" fill="#334155">Pilot Carrier</text>
            
            <line x1="15" y1="64" x2="35" y2="64" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3,3" />
            <text x="45" y="68" fontSize="12" fill="#334155">Null (Guard) Carrier</text>
            
            <circle cx="25" cy="86" r="3.5" fill="#ef4444" />
            <text x="45" y="90" fontSize="12" fill="#334155">DC (Center) Carrier</text>
          </g>

        </svg>
      </div>
    </div>
  );
};

export default SubcarrierDiagram;
