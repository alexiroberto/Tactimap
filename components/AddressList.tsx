import React, { useState } from 'react';
import { Zone, TacticalMarker } from '../types';
import { AMBULANCE_ICON, ASSEMBLY_ICON, DECON_ICON, COMMAND_ICON } from '../constants';

interface AddressListProps {
  zones: Zone[];
  markers: TacticalMarker[];
  onDeleteZone: (id: string) => void;
  onDeleteMarker: (id: string) => void;
}

const AddressList: React.FC<AddressListProps> = ({ zones, markers, onDeleteZone, onDeleteMarker }) => {
  const [isMinimized, setIsMinimized] = useState(false);

  if (zones.length === 0 && markers.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
        case 'assembly': return <span className="text-xl">✚</span>;
        case 'decon': return <span className="text-xl">🚿</span>;
        case 'command': return <span className="text-xl">📦</span>;
        case 'breakpoint': return <span className="text-xl">🚑</span>;
        default: return <span className="text-xl">📍</span>;
    }
  };

  const getColorClass = (type: string) => {
    switch(type) {
      case 'breakpoint': return 'text-red-400 border-red-500/30 bg-red-500/10';
      case 'assembly': return 'text-red-400 border-red-500/30 bg-red-500/10';
      case 'decon': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'command': return 'text-green-400 border-green-500/30 bg-green-500/10';
      case 'zone': return 'text-red-500 border-red-500/50 bg-red-900/20';
      default: return 'text-slate-300 border-white/10';
    }
  };

  const getLabel = (type: string) => {
      switch(type) {
          case 'breakpoint': return 'Brytpunkt';
          case 'assembly': return 'Uppsamling';
          case 'decon': return 'Sanering';
          case 'command': return 'FRS / Ledning';
          default: return 'Okänd';
      }
  };

  return (
    <div className={`pointer-events-auto z-20 w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in transition-all duration-300 ${isMinimized ? 'h-auto' : 'max-h-[calc(100vh-150px)]'}`}>
      <div 
        className="p-4 border-b border-white/5 bg-slate-950/50 flex justify-between items-center shrink-0 cursor-pointer hover:bg-slate-900/80 transition-colors"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          Adresser & Resurser
        </h3>
        <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">{zones.length + markers.length}</span>
            <button 
                className="text-slate-400 hover:text-white transition-colors"
            >
                {isMinimized ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" transform="rotate(180 12 12)" /></svg>
                )}
            </button>
        </div>
      </div>
      
      {!isMinimized && (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
            {/* ZONES */}
            {zones.map((zone, idx) => (
                <div key={zone.id} className={`rounded-xl p-3 border flex items-start gap-3 relative group ${getColorClass('zone')}`}>
                    <div className="mt-1">
                        <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Riskavstånd #{idx + 1}</span>
                            <button onClick={(e) => { e.stopPropagation(); onDeleteZone(zone.id); }} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <p className="text-xs font-mono font-medium text-white truncate mt-0.5" title={zone.address || "Hämtar adress..."}>
                            {zone.address || "Hämtar adress..."}
                        </p>
                        <div className="flex gap-2 mt-1">
                            <span className="text-[9px] bg-black/30 px-1 rounded text-red-300">R: {Math.round(zone.radius)}m</span>
                            {zone.type !== 'circle' && <span className="text-[9px] bg-black/30 px-1 rounded text-amber-300">{zone.bearing}°</span>}
                        </div>
                    </div>
                </div>
            ))}

            {/* MARKERS */}
            {markers.map((marker, idx) => (
                <div key={marker.id} className={`rounded-xl p-3 border flex items-start gap-3 relative group ${getColorClass(marker.type)}`}>
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-slate-900/50 rounded-lg">
                        {getIcon(marker.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">{getLabel(marker.type)}</span>
                            <button onClick={(e) => { e.stopPropagation(); onDeleteMarker(marker.id); }} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <p className="text-xs font-mono font-medium text-white break-words mt-0.5">
                            {marker.label || "Hämtar adress..."}
                        </p>
                        <span className="text-[9px] font-mono opacity-40 mt-1 block">{marker.lat.toFixed(5)}, {marker.lng.toFixed(5)}</span>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default AddressList;