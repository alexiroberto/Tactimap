import React, { useState } from 'react';
import { Zone, TacticalMarker } from '../types';

interface AddressListProps {
  zones: Zone[];
  markers: TacticalMarker[];
  onDeleteZone: (id: string) => void;
  onDeleteMarker: (id: string) => void;
}

const AddressList: React.FC<AddressListProps> = ({ zones, markers, onDeleteZone, onDeleteMarker }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
        case 'assembly': return <span className="text-xl">✚</span>;
        case 'decon': return <span className="text-xl">🚿</span>;
        case 'command': return <span className="text-sm font-black">FRS</span>;
        case 'breakpoint': return <span className="text-xl font-bold">BP</span>;
        case 'ledningsplats': return <span className="text-xl font-bold">LP</span>;
        case 'sps': return <span className="text-xl">🏥</span>;
        case 'sektor': return <span className="text-xl">💠</span>;
        case 'mob': return (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16Z"/>
            </svg>
        );
        default: return <span className="text-xl">📍</span>;
    }
  };

  const getColorClass = (type: string) => {
    switch(type) {
      case 'breakpoint': return 'text-red-400 border-red-500/30 bg-red-500/10';
      case 'assembly': return 'text-red-400 border-red-500/30 bg-red-500/10';
      case 'decon': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'command': return 'text-green-400 border-green-500/30 bg-green-500/10';
      case 'ledningsplats': return 'text-red-400 border-red-600/40 bg-red-600/10';
      case 'sps': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
      case 'sektor': return 'text-slate-300 border-slate-500/30 bg-slate-500/10';
      case 'mob': return 'text-white border-red-600 bg-red-900/50 shadow-lg shadow-red-900/50';
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
          case 'ledningsplats': return 'Ledningsplats';
          case 'sps': return 'SPS';
          case 'sektor': return 'Sektor';
          case 'mob': return 'MAN ÖVERBORD';
          default: return 'Okänd';
      }
  };

  const totalCount = zones.length + markers.length;

  return (
    <>
      {/* Toggle Button in TopBar */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`
            h-12 px-4 rounded-full text-xs font-bold tracking-wider transition-all flex items-center gap-2 shadow-2xl border
            ${isOpen 
            ? 'bg-blue-600/90 text-white border-blue-400/20' 
            : 'bg-slate-900/80 backdrop-blur-xl text-slate-400 border-white/10 hover:bg-slate-800'}
        `}
      >
         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
         </svg>
         <span className="hidden md:inline">RESURSER</span>
         {totalCount > 0 && <span className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded ml-1">{totalCount}</span>}
      </button>

      {/* Responsive Modal/Popup */}
      {isOpen && (
        <div className="absolute top-16 right-0 w-full md:w-96 z-50 animate-fade-in-down">
            <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden max-h-[70vh] flex flex-col mx-0 md:mx-0">
                <div className="p-4 border-b border-white/5 bg-slate-950/50 flex justify-between items-center shrink-0">
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    Adresser & Resurser
                    </h3>
                    <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                    {totalCount === 0 && (
                        <div className="text-center py-8 text-slate-500 text-xs">
                            Inga zoner eller markörer placerade.
                        </div>
                    )}

                    {/* ZONES */}
                    {zones.map((zone, idx) => (
                        <div key={zone.id} className={`rounded-xl p-3 border flex items-start gap-3 relative group ${getColorClass('zone')}`}>
                            <div className="mt-1">
                                <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Riskavstånd #{idx + 1}</span>
                                    <button onClick={(e) => { e.stopPropagation(); onDeleteZone(zone.id); }} className="text-slate-500 hover:text-red-400 p-2 -mr-1 rounded-full hover:bg-white/5 active:bg-white/10 transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
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
                                    <button onClick={(e) => { e.stopPropagation(); onDeleteMarker(marker.id); }} className="text-slate-500 hover:text-red-400 p-2 -mr-1 rounded-full hover:bg-white/5 active:bg-white/10 transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
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
            </div>
        </div>
      )}
    </>
  );
};

export default AddressList;