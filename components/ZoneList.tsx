import React, { useState } from 'react';
import { Zone } from '../types';
import { getCardinalDirection } from '../constants';

interface ZoneListProps {
  zones: Zone[];
  onDeleteZone: (id: string) => void;
}

const ZoneList: React.FC<ZoneListProps> = ({ zones, onDeleteZone }) => {
  // In the mobile redesign, we might hide this component if no zones exist to save space
  if (zones.length === 0) return null;

  return (
    <div className="hidden md:flex absolute top-24 right-4 z-10 w-64 max-h-[calc(100vh-250px)] bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-xl flex-col overflow-hidden transition-all duration-300 pointer-events-auto">
      <div className="p-3 border-b border-white/5 bg-slate-900/50 flex justify-between items-center shrink-0">
        <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
          Aktiva Zoner
        </h3>
        <span className="text-[9px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">{zones.length}</span>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
          {zones.map((zone, index) => {
             const isComplex = zone.type === 'sector' || zone.type === 'keyhole';
             return (
                <div 
                  key={zone.id}
                  className="group relative bg-slate-800/40 border border-white/5 hover:border-red-500/30 rounded-lg p-2.5 transition-all hover:bg-slate-800"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold font-mono ${isComplex ? 'text-amber-400' : 'text-slate-300'}`}>
                            {zone.type === 'keyhole' ? 'NYCKELHÅL' : zone.type === 'sector' ? 'SEKTOR' : 'CIRKEL'} 
                            <span className="opacity-50 ml-1">#{index + 1}</span>
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono flex items-center gap-2">
                         <span>R: {zone.radius}m</span>
                      </span>
                    </div>
                    
                    <button
                      onClick={() => onDeleteZone(zone.id)}
                      className="text-slate-600 hover:text-red-400 p-1 rounded hover:bg-red-950/30 transition-colors"
                      title="Ta bort zon"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Expanded Details for Complex Zones */}
                  {isComplex && (
                      <div className="mt-2 pt-1 border-t border-white/5 grid grid-cols-2 gap-y-1 gap-x-2 animate-fade-in">
                          <div className="flex flex-col">
                              <span className="text-[8px] uppercase tracking-widest text-slate-600">Vind</span>
                              <div className="flex items-center gap-1 text-[9px] font-mono text-slate-400">
                                  <svg className="w-2.5 h-2.5 text-amber-500" style={{ transform: `rotate(${zone.bearing || 0}deg)` }} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15 20L12 17L9 20L12 2Z" /></svg>
                                  <span>{zone.bearing}°</span>
                              </div>
                          </div>
                          {zone.innerRadius && (
                              <div className="flex flex-col">
                                  <span className="text-[8px] uppercase tracking-widest text-slate-600">Inre</span>
                                  <span className="text-[9px] font-mono text-slate-400">{zone.innerRadius}m</span>
                              </div>
                          )}
                      </div>
                  )}
                </div>
             );
          })}
      </div>
    </div>
  );
};

export default ZoneList;