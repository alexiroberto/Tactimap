import React, { useState, useEffect, useRef } from 'react';
import { DANGEROUS_GOODS, getCardinalDirection } from '../constants';
import { MapCenter, WindData, TacticalMarker, ToolType } from '../types';
import ScenarioModal from './ScenarioModal';

interface ControlPanelProps {
  radius: number;
  setRadius: (radius: number) => void;
  innerRadius: number;
  setInnerRadius: (radius: number) => void;
  zoneCount: number;
  activeZoneType: 'circle' | 'sector' | 'keyhole';
  setActiveZoneType: (type: 'circle' | 'sector' | 'keyhole') => void;
  windDirection: number;
  setWindDirection: (degrees: number) => void;
  currentMapCenter: MapCenter;
  onGenerateBreakpoints?: () => void;
  isGeneratingBreakpoints?: boolean;
  markers?: TacticalMarker[];
  onAddMarker?: (lat: number, lng: number, label: string, type: TacticalMarker['type']) => void;
  onFetchRoads?: () => void;
  isFetchingRoads?: boolean;
  onOpenHAIntegration?: () => void;
  
  // New Unified Tool Prop
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  radius,
  setRadius,
  innerRadius,
  setInnerRadius,
  zoneCount,
  activeZoneType,
  setActiveZoneType,
  windDirection,
  setWindDirection,
  currentMapCenter,
  onGenerateBreakpoints,
  isGeneratingBreakpoints,
  markers = [],
  onAddMarker,
  onFetchRoads,
  isFetchingRoads,
  onOpenHAIntegration,
  activeTool,
  setActiveTool
}) => {
  const [selectedScenarioLabel, setSelectedScenarioLabel] = useState<string>("Anpassad radie");
  const [weatherApiKey, setWeatherApiKey] = useState<string>("faa6473597f16a61bce78ba8378afef1");
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isFetchingWeather, setIsFetchingWeather] = useState<boolean>(false);
  const [windData, setWindData] = useState<WindData | null>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Modal State
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState<boolean>(false);
  
  // UN Search State
  const [unSearchQuery, setUnSearchQuery] = useState("");
  const [unSearchResults, setUnSearchResults] = useState<typeof DANGEROUS_GOODS>([]);

  // Update UN search results
  useEffect(() => {
    if (!unSearchQuery) {
        setUnSearchResults([]);
        return;
    }
    const lower = unSearchQuery.toLowerCase();
    const results = DANGEROUS_GOODS.filter(item => 
        item.label.toLowerCase().includes(lower) || 
        item.un.toLowerCase().includes(lower) ||
        item.info.toLowerCase().includes(lower)
    );
    setUnSearchResults(results);
  }, [unSearchQuery]);

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
    setSelectedScenarioLabel("Anpassad radie");
  };

  const handleInnerRadiusChange = (newRadius: number) => {
    setInnerRadius(newRadius);
    setSelectedScenarioLabel("Anpassad radie");
  };

  const selectScenario = (item: any) => {
    setRadius(item.radius);
    setSelectedScenarioLabel(item.label);
    setActiveZoneType(item.type as 'circle' | 'sector' | 'keyhole');
    
    if ((item.type === 'keyhole' || item.type === 'sector') && item.innerRadius) {
      setInnerRadius(item.innerRadius);
    } else {
        if (item.type !== 'keyhole') setInnerRadius(50);
    }
    
    // Automatically activate zone placement tool when a scenario is selected
    setActiveTool('zone');

    setIsScenarioModalOpen(false);
    setUnSearchQuery(""); // Clear search
  };

  const fetchWindData = async (lat: number, lng: number) => {
    if (!weatherApiKey) {
      alert("Ange OpenWeatherMap API-nyckel i inställningar.");
      setShowSettings(true);
      return;
    }

    setIsFetchingWeather(true);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${weatherApiKey}&units=metric`
      );
      
      if (!response.ok) throw new Error("Kunde inte hämta väderdata.");

      const data = await response.json();
      if (data.wind) {
        setWindData({
          speed: data.wind.speed,
          deg: data.wind.deg,
          timestamp: Date.now()
        });
        setWindDirection(data.wind.deg);
        if (activeZoneType === 'circle') {
             setActiveZoneType('keyhole');
        }
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsFetchingWeather(false);
    }
  };

  const handleGeometryClick = (type: 'circle' | 'sector' | 'keyhole') => {
    if (activeTool === 'zone' && activeZoneType === type) {
      setActiveTool('none');
    } else {
      setActiveZoneType(type);
      setActiveTool('zone');
    }
  };

  return (
    <>
      <div className={`w-[320px] glass-panel rounded-3xl overflow-hidden flex flex-col transition-all duration-500 ring-1 ring-white/5 shadow-2xl ${isMinimized ? 'h-auto' : 'max-h-[85vh]'}`}>
        
        {/* Sleek Header */}
        <div className="bg-gradient-to-b from-slate-900/50 to-transparent px-6 py-5 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-sm font-bold tracking-wide text-white flex items-center gap-2 font-sans">
              <div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
              SÄKERHETSZON
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
            <button 
              onClick={() => setIsMinimized(!isMinimized)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              {isMinimized ? (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              ) : (
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {!isMinimized && showSettings && (
          <div className="bg-slate-900/50 p-6 border-b border-white/5 animate-fade-in-down shrink-0">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
              OpenWeatherMap API Key
            </label>
            <input
              type="text"
              value={weatherApiKey}
              onChange={(e) => setWeatherApiKey(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-3 text-xs text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-mono transition-all"
              placeholder="Key..."
            />
          </div>
        )}

        {/* Main Content */}
        {!isMinimized && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 min-h-0">

             {/* MAIN TOOL SELECTOR */}
             <div className="space-y-3 shrink-0">
                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Välj Verktyg</label>
                 
                 {/* Marker Tools */}
                 <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'breakpoint', label: 'Brytpunkt', color: 'bg-red-500/20 text-red-400 border-red-500/50', icon: '🚑' },
                      { id: 'assembly', label: 'Uppsamling', color: 'bg-red-500/20 text-red-400 border-red-500/50', icon: '✚' },
                      { id: 'decon', label: 'Sanering', color: 'bg-amber-500/20 text-amber-400 border-amber-500/50', icon: '🚿' },
                      { id: 'command', label: 'FRS', color: 'bg-green-500/20 text-green-400 border-green-500/50', icon: '📦' }
                    ].map((m) => {
                        const isActive = activeTool === m.id;
                        return (
                          <button 
                              key={m.id} 
                              onClick={() => setActiveTool(isActive ? 'none' : m.id as ToolType)}
                              className={`
                                  flex flex-col items-center justify-center py-2 rounded-xl border transition-all duration-200
                                  ${isActive 
                                      ? m.color + ' ring-1 ring-white/20 shadow-lg scale-[1.02]' 
                                      : 'bg-slate-900/50 border-white/5 text-slate-500 hover:bg-slate-800 hover:text-slate-300'}
                              `}
                          >
                              <span className="text-lg">{m.icon}</span>
                              <span className="text-[8px] font-bold uppercase mt-1">{m.label}</span>
                          </button>
                        );
                    })}
                 </div>
                 
                 {activeTool !== 'none' && (
                   <div className="text-[10px] text-center font-mono text-blue-300 animate-pulse bg-blue-500/10 py-1 rounded-lg border border-blue-500/20">
                      KLICKA PÅ KARTAN FÖR ATT PLACERA
                   </div>
                 )}
             </div>


            {/* DANGEROUS GOODS SEARCH */}
            <div className="space-y-2 shrink-0">
               <label className="text-[10px] font-bold text-amber-500 uppercase tracking-widest pl-1">Farligt Gods (UN)</label>
               <div className="relative">
                  <input
                      type="text"
                      value={unSearchQuery}
                      onChange={(e) => setUnSearchQuery(e.target.value)}
                      placeholder="Sök UN-nummer eller ämne..."
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3 pl-9 text-xs text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none"
                  />
                  <svg className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  
                  {unSearchQuery && unSearchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-amber-500/30 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar">
                          {unSearchResults.map((item, idx) => (
                              <button
                                  key={idx}
                                  onClick={() => selectScenario(item)}
                                  className="w-full text-left px-4 py-3 border-b border-white/5 last:border-0 hover:bg-amber-500/10 flex flex-col gap-1"
                              >
                                  <div className="flex justify-between">
                                      <span className="text-xs font-bold text-white">{item.label}</span>
                                      <span className="text-[10px] font-mono text-amber-400">{item.radius}m</span>
                                  </div>
                                  <span className="text-[10px] text-slate-400">{item.info}</span>
                              </button>
                          ))}
                      </div>
                  )}
               </div>
            </div>

            {/* Geometry Selector */}
            <div className="space-y-3 shrink-0">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Geometri (Placera Zon)</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'circle', label: 'Riskavstånd', icon: <div className="w-4 h-4 rounded-full border-2 border-current"></div> },
                  { id: 'keyhole', label: 'Riskavstånd vindriktning', icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="18" r="4"/><path d="M8.5 16L2 2h20l-6.5 14"/></svg> }
                ].map((type) => {
                   const isSelected = activeZoneType === type.id && activeTool === 'zone';
                   return (
                      <button
                        key={type.id}
                        onClick={() => handleGeometryClick(type.id as any)}
                        className={`
                          flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border transition-all duration-300
                          ${isSelected 
                            ? 'bg-gradient-to-br from-blue-600/20 to-blue-500/10 border-blue-500/50 text-blue-400 shadow-glow-blue ring-1 ring-blue-500/30' 
                            : 'bg-slate-900/40 border-white/5 text-slate-500 hover:bg-slate-800 hover:border-white/10'
                          }
                        `}
                      >
                        {type.icon}
                        <span className="text-[10px] font-semibold text-center leading-tight">{type.label}</span>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse mt-1"></div>}
                      </button>
                   );
                })}
              </div>
            </div>

            {/* Scenario Button (Popup) */}
            <div className="space-y-2 shrink-0">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Scenario (Standard)</label>
              <button
                onClick={() => setIsScenarioModalOpen(true)}
                className="w-full bg-slate-900/80 border border-white/10 hover:border-blue-500/50 hover:bg-blue-900/10 text-left text-xs rounded-xl p-4 flex justify-between items-center transition-all group shadow-md"
              >
                <div className="flex flex-col gap-1">
                   <span className="text-[10px] text-slate-500 uppercase">Valt Scenario</span>
                   <span className={`truncate font-bold ${selectedScenarioLabel === "Anpassad radie" ? 'text-slate-300' : 'text-blue-300'}`}>
                      {selectedScenarioLabel}
                   </span>
                </div>
                <div className="bg-slate-800 p-2 rounded-lg text-slate-400 group-hover:text-white transition-colors">
                   <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                </div>
              </button>
            </div>

            {/* Sliders Area */}
            <div className="space-y-8 py-2 shrink-0">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {activeZoneType === 'keyhole' ? 'Yttre Radie (Het Zon)' : 'Säkerhetsavstånd (Het Zon)'}
                  </label>
                  <div className="flex items-baseline gap-1">
                    <input 
                      type="number"
                      min="0"
                      max="10000"
                      value={radius}
                      onChange={(e) => handleRadiusChange(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-20 bg-transparent text-right font-mono text-white text-xl font-bold tracking-tight focus:outline-none focus:border-b focus:border-white/20 p-0 m-0"
                    />
                    <span className="text-sm text-slate-500 font-sans">m</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3000" 
                  step="50"
                  value={radius}
                  onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
                  className="slider-red"
                />
              </div>
              {/* ... Inner Radius & Wind Card ... */}
              {activeZoneType === 'keyhole' && (
                <div className="space-y-4 pt-2 border-t border-white/5">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Inre Radie</label>
                    <div className="flex items-baseline gap-1">
                      <input 
                        type="number" min="0" max="5000" value={innerRadius} onChange={(e) => handleInnerRadiusChange(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-20 bg-transparent text-right font-mono text-amber-400 text-xl font-bold tracking-tight focus:outline-none focus:border-b focus:border-amber-500/20 p-0 m-0"
                      />
                      <span className="text-sm text-slate-500 font-sans">m</span>
                    </div>
                  </div>
                  <input type="range" min="0" max="1000" step="10" value={innerRadius} onChange={(e) => handleInnerRadiusChange(parseInt(e.target.value))} className="slider-amber" />
                </div>
              )}
            </div>
            
             {/* Wind Control (Simplified for view) */}
             {activeZoneType === 'keyhole' && (
              <div className="bg-gradient-to-br from-amber-950/30 to-slate-900/50 rounded-2xl border border-amber-900/30 p-5 space-y-4 relative overflow-hidden group shrink-0">
                 <div className="flex justify-between items-center relative z-10">
                   <label className="text-[10px] font-bold text-amber-500/80 uppercase tracking-widest">Vind</label>
                   {windData && <span className="text-[10px] font-mono text-amber-300">{windData.speed} m/s</span>}
                 </div>
                 <div className="flex items-center gap-5 relative z-10">
                   <div className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-950 border border-slate-700 shadow-lg text-amber-500" style={{ transform: `rotate(${windDirection}deg)` }}>
                     <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15 20L12 17L9 20L12 2Z" /></svg>
                   </div>
                   <div className="flex-1">
                      <input type="range" min="0" max="360" step="5" value={windDirection} onChange={(e) => setWindDirection(parseInt(e.target.value))} className="slider-amber" />
                   </div>
                 </div>
                 <button onClick={() => fetchWindData(currentMapCenter.lat, currentMapCenter.lng)} className="w-full py-2 text-[10px] uppercase font-bold text-amber-200/80 bg-white/5 rounded-lg">{isFetchingWeather ? 'Hämtar...' : 'Live Data'}</button>
              </div>
             )}

            {/* Removed Manual Coordinate Input here */}

            {zoneCount > 0 && (
               <div className="space-y-2 mt-4 pt-4 border-t border-white/10">
                 {onGenerateBreakpoints && <button onClick={onGenerateBreakpoints} disabled={isGeneratingBreakpoints} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-4 text-white font-bold text-xs uppercase">{isGeneratingBreakpoints ? 'Genererar...' : 'Generera Brytpunkter'}</button>}
                 {onFetchRoads && <button onClick={onFetchRoads} disabled={isFetchingRoads} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 text-white font-bold text-xs uppercase">{isFetchingRoads ? 'Hämtar...' : 'Markera Stora Vägar (5km)'}</button>}
               </div>
            )}
          </div>
        )}

        {/* Footer */}
        {!isMinimized && (
          <div className="bg-slate-900/60 p-4 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-slate-500/80 shrink-0">
            <span>ACTIVE_ZONES: {zoneCount}</span>
            <button 
               onClick={onOpenHAIntegration}
               className="text-blue-400 hover:text-white transition-colors uppercase font-bold"
            >
              HA INTEGRATION
            </button>
          </div>
        )}
      </div>

      {/* Scenario Modal Popup */}
      <ScenarioModal 
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
        onSelect={selectScenario}
      />
    </>
  );
};

export default ControlPanel;