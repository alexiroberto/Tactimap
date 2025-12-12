import React from 'react';
import { Zone } from '../types';
import { getCardinalDirection } from '../constants';

interface ZoneListProps {
  zones: Zone[];
  onDeleteZone: (id: string) => void;
}

const ZoneList: React.FC<ZoneListProps> = ({ zones, onDeleteZone }) => {
  return (
    <div className="absolute top-24 right-4 z-20 w-64 max-h-[calc(100vh-150px)] bg-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 pointer-events-auto">
      <div className="p-4 border-b border-white/5 bg-slate-900/50 flex justify-between items-center shrink-0">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
          Aktiva Zoner
        </h3>
        <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">{zones.length}</span>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
        {zones.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-slate-600 space-y-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] font-mono uppercase tracking-widest">System Redo</span>
          </div>
        ) : (
          zones.map((zone, index) => {
             const isComplex = zone.type === 'sector' || zone.type === 'keyhole';
             return (
                <div 
                  key={zone.id}
                  className="group relative bg-slate-800/40 border border-white/5 hover:border-red-500/30 rounded-xl p-3 transition-all hover:bg-slate-800"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold font-mono ${isComplex ? 'text-amber-400' : 'text-slate-300'}`}>
                            {zone.type === 'keyhole' ? 'NYCKELHÅL' : zone.type === 'sector' ? 'SEKTOR' : 'CIRKEL'} 
                            <span className="opacity-50 ml-1">#{index + 1}</span>
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono flex items-center gap-2">
                         <span>R: {zone.radius}m</span>
                         <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                         <span>{new Date(zone.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </span>
                    </div>
                    
                    <button
                      onClick={() => onDeleteZone(zone.id)}
                      className="text-slate-600 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-950/30 transition-colors"
                      title="Ta bort zon"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Expanded Details for Complex Zones */}
                  {isComplex && (
                      <div className="mt-3 pt-2 border-t border-white/5 grid grid-cols-2 gap-y-2 gap-x-4 animate-fade-in">
                          <div className="flex flex-col">
                              <span className="text-[8px] uppercase tracking-widest text-slate-500">Vindriktning</span>
                              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-300">
                                  <svg className="w-3 h-3 text-amber-500" style={{ transform: `rotate(${zone.bearing || 0}deg)` }} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15 20L12 17L9 20L12 2Z" /></svg>
                                  <span>{zone.bearing}° {getCardinalDirection(zone.bearing || 0)}</span>
                              </div>
                          </div>
                          
                          <div className="flex flex-col">
                              <span className="text-[8px] uppercase tracking-widest text-slate-500">Spridning</span>
                              <span className="text-[10px] font-mono text-slate-300">{zone.type === 'keyhole' ? '45°' : '60°'}</span>
                          </div>

                          {zone.innerRadius && (
                              <div className="flex flex-col col-span-2">
                                  <span className="text-[8px] uppercase tracking-widest text-slate-500">Inre Radie (Het Zon)</span>
                                  <span className="text-[10px] font-mono text-slate-300">{zone.innerRadius}m</span>
                              </div>
                          )}
                      </div>
                  )}
                </div>
             );
          })
        )}
      </div>
    </div>
  );
};

export default ZoneList;