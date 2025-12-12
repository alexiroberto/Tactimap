import React, { useState } from 'react';
import { TacticalMarker, Zone } from '../types';

interface HAIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  markers: TacticalMarker[];
  zones: Zone[];
}

const HAIntegrationModal: React.FC<HAIntegrationModalProps> = ({ isOpen, onClose, markers, zones }) => {
  const [activeTab, setActiveTab] = useState<'lovelace' | 'scripts'>('scripts');

  if (!isOpen) return null;

  // Helper to map app types to HA types defined in your Pyscript
  const mapTypeToHAType = (type: string) => {
    switch (type) {
      case 'breakpoint': return 'brytpunkt';
      case 'assembly': return 'uppsamling';
      case 'decon': return 'sanering';
      case 'command': return 'frs';
      default: return 'unknown';
    }
  };

  // Generate Service Calls based on current map state
  const generateServiceCalls = () => {
    if (markers.length === 0) return "# Inga markörer placerade på kartan ännu.";

    return markers.map(marker => {
      const haType = mapTypeToHAType(marker.type);
      if (haType === 'unknown') return null;

      return `service: pyscript.set_tactical_marker
data:
  marker_type: ${haType}
  lat: ${marker.lat.toFixed(6)}
  lon: ${marker.lng.toFixed(6)}`;
    }).filter(Boolean).join('\n\n');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Kod kopierad till urklipp!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="bg-slate-950/50 px-6 py-4 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Home Assistant Integration</h2>
              <p className="text-xs text-slate-500 font-mono">PYSCRIPT / LOVELACE BRIDGE</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 bg-slate-900/50">
           <button 
             onClick={() => setActiveTab('scripts')}
             className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'scripts' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
           >
             Aktuella Positioner (YAML)
           </button>
           <button 
             onClick={() => setActiveTab('lovelace')}
             className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'lovelace' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
           >
             Map Card Config
           </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-950/30">
          
          {activeTab === 'scripts' && (
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
                <p className="text-xs text-blue-200 leading-relaxed">
                  Här är YAML-koden för att uppdatera Home Assistant med de markörer du placerat ut på kartan just nu. 
                  Kör dessa som "Call Service" i Developer Tools eller klistra in i ett script.
                </p>
              </div>

              <div className="relative group">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => copyToClipboard(generateServiceCalls())} className="bg-slate-700 hover:bg-slate-600 text-xs text-white px-2 py-1 rounded shadow">
                    Kopiera
                  </button>
                </div>
                <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-[10px] md:text-xs font-mono text-emerald-400 overflow-x-auto">
                  {generateServiceCalls()}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'lovelace' && (
            <div className="space-y-4">
               <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Använd denna konfiguration i din Lovelace Dashboard (Map Card) för att visa entiteterna.
                </p>
              </div>
              <div className="relative group">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => copyToClipboard(`type: map
default_zoom: 12
dark_mode: true
hours_to_show: 0
entities:
  - entity: device_tracker.tactical_brytpunkt
  - entity: device_tracker.tactical_uppsamling
  - entity: device_tracker.tactical_sanering
  - entity: device_tracker.tactical_frs
  ${zones.length > 0 ? '# Du kan också behöva skapa Zoner i HA configuration.yaml om du vill visa cirklarna' : ''}`)} className="bg-slate-700 hover:bg-slate-600 text-xs text-white px-2 py-1 rounded shadow">
                    Kopiera
                  </button>
                </div>
                <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-[10px] md:text-xs font-mono text-blue-300 overflow-x-auto">
{`type: map
default_zoom: 12
dark_mode: true
hours_to_show: 0
entities:
  - entity: device_tracker.tactical_brytpunkt
  - entity: device_tracker.tactical_uppsamling
  - entity: device_tracker.tactical_sanering
  - entity: device_tracker.tactical_frs`}
                </pre>
              </div>
            </div>
          )}

        </div>
        
        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-white/5 flex justify-end">
           <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase rounded-lg transition-colors">
             Stäng
           </button>
        </div>
      </div>
    </div>
  );
};

export default HAIntegrationModal;
