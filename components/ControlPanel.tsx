import React, { useState, useEffect } from 'react';
import { DANGEROUS_GOODS } from '../constants';
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
  
  // New GPS Prop
  onPlaceAtCurrentLocation?: () => void;
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
  onFetchRoads,
  isFetchingRoads,
  onOpenHAIntegration,
  activeTool,
  setActiveTool,
  onPlaceAtCurrentLocation,
}) => {
  const [selectedScenarioLabel, setSelectedScenarioLabel] = useState<string>("Anpassad radie");
  const [weatherApiKey, setWeatherApiKey] = useState<string>("faa6473597f16a61bce78ba8378afef1");
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [isFetchingWeather, setIsFetchingWeather] = useState<boolean>(false);
  const [windData, setWindData] = useState<WindData | null>(null);
  
  // Responsive State
  // Mobile: "Expanded" means sheet is pulled up. "Collapsed" means only header/summary is visible.
  // Desktop: "Minimized" means small icon. "Normal" means full sidebar.
  const [isMobileExpanded, setIsMobileExpanded] = useState<boolean>(false);
  const [isDesktopMinimized, setIsDesktopMinimized] = useState<boolean>(false);

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
    // On mobile, collapse to see the map after selection
    if (window.innerWidth < 768) {
        setIsMobileExpanded(false);
    }
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

  // Toggle function handles both mobile sheet and desktop sidebar
  const togglePanel = () => {
    if (window.innerWidth < 768) {
      setIsMobileExpanded(!isMobileExpanded);
    } else {
      setIsDesktopMinimized(!isDesktopMinimized);
    }
  };

  return (
    <>
      <div 
        className={`
            fixed z-30 transition-all duration-500 ease-in-out shadow-2xl glass-panel
            
            /* Mobile Styles (Bottom Sheet) */
            bottom-0 left-0 right-0 rounded-t-3xl border-t border-white/10
            ${isMobileExpanded ? 'h-[85vh]' : 'h-24'} 
            
            /* Desktop Styles (Sidebar) */
            md:absolute md:top-4 md:left-4 md:right-auto md:bottom-auto 
            md:rounded-3xl md:h-auto md:max-h-[85vh]
            ${isDesktopMinimized ? 'md:w-auto md:h-auto' : 'md:w-[360px]'}
        `}
      >
        
        {/* Mobile Drag Handle */}
        <div 
            className="md:hidden w-full h-6 flex items-center justify-center cursor-pointer"
            onClick={() => setIsMobileExpanded(!isMobileExpanded)}
        >
             <div className="w-12 h-1.5 bg-slate-600/50 rounded-full"></div>
        </div>

        {/* Header Section */}
        <div className="px-6 pb-2 md:pt-5 md:pb-5 flex justify-between items-center shrink-0">
          <div className="flex flex-col">
            <h2 className="text-sm font-bold tracking-wide text-white flex items-center gap-2 font-sans" onClick={togglePanel}>
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
              SÄKERHETSZON
            </h2>
            {/* Mobile Summary (Visible when collapsed) */}
            <div className="md:hidden text-[10px] text-slate-400 mt-1 flex gap-3">
                 <span>{activeZoneType === 'keyhole' ? 'Nyckelhål' : 'Cirkel'} {radius}m</span>
                 <span>|</span>
                 <span>Verktyg: {activeTool !== 'none' ? activeTool.toUpperCase() : 'Inget'}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
            <button 
              onClick={togglePanel}
              className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors bg-white/5 md:bg-transparent"
            >
              {/* Icon changes based on state and device */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {/* Mobile Up/Down Chevron logic is handled by rotation or path swap */}
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isDesktopMinimized ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"} className="hidden md:block" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileExpanded ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"} className="md:hidden" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content Wrapper - handles visibility for both modes */}
        <div className={`
             flex flex-col h-full
             ${(isDesktopMinimized) ? 'hidden' : 'block'}
             ${(!isMobileExpanded && window.innerWidth < 768) ? 'hidden' : 'flex'}
        `}>

            {/* Settings Panel */}
            {showSettings && (
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

            {/* Scrollable Main Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 min-h-0 pb-20 md:pb-6">

                {/* MAIN TOOL SELECTOR */}
                <div className="space-y-3 shrink-0">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Välj Verktyg</label>

                    <div className="grid grid-cols-4 gap-3">
                        {[
                          { id: 'breakpoint', label: 'Brytpunkt', color: 'bg-red-500/20 text-red-400 border-red-500/50', icon: 'BP' },
                          { id: 'assembly', label: 'Uppsamling', color: 'bg-red-500/20 text-red-400 border-red-500/50', icon: '✚' },
                          { id: 'decon', label: 'Sanering', color: 'bg-amber-500/20 text-amber-400 border-amber-500/50', icon: '🚿' },
                          { id: 'command', label: 'FRS', color: 'bg-green-500/20 text-green-400 border-green-500/50', icon: 'FRS' },
                          { id: 'ledningsplats', label: 'Ledningsplats', color: 'bg-red-600/20 text-red-400 border-red-600/50', icon: 'LP' },
                          { id: 'sps', label: 'SPS', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50', icon: '🏥' },
                          { id: 'sektor', label: 'Sektor', color: 'bg-slate-500/20 text-slate-300 border-slate-500/50', icon: '💠' },
                          { 
                            id: 'mob', 
                            label: 'MOB', 
                            // Solid blue when active
                            color: 'bg-blue-600 text-white border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.5)]', 
                            icon: (
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h3m10 0h3m-9-9v3m0 10v3" />
                                </svg>
                            )
                          },
                        ].map((m) => {
                            const isActive = activeTool === m.id;
                            return (
                              <button 
                                  key={m.id} 
                                  onClick={() => {
                                      setActiveTool(isActive ? 'none' : m.id as ToolType);
                                      if (window.innerWidth < 768) setIsMobileExpanded(false); // Close on mobile selection
                                  }}
                                  className={`
                                      flex flex-col items-center justify-center py-3 rounded-xl border transition-all duration-200 touch-manipulation
                                      ${isActive 
                                          ? m.color + ' ring-1 ring-white/20 shadow-lg scale-[1.02]' 
                                          : 'bg-slate-900/50 border-white/5 text-slate-500 hover:bg-slate-800 hover:text-slate-300'}
                                  `}
                                  title={m.label}
                              >
                                  <span className="text-2xl mb-1 font-black flex items-center justify-center">{m.icon}</span>
                                  <span className="text-[9px] font-bold uppercase truncate w-full text-center px-1">{m.label}</span>
                              </button>
                            );
                        })}
                    </div>
                    
                    {activeTool !== 'none' && activeTool !== 'mob' && (
                      <div className="space-y-2 mt-2">
                          <button
                            onClick={onPlaceAtCurrentLocation}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            PLACERA PÅ MIN GPS-POSITION
                          </button>
                          
                          <div className="text-[10px] text-center font-mono text-blue-300/70 bg-blue-500/5 py-1.5 rounded-lg border border-blue-500/10">
                             Eller klicka på kartan för att placera
                          </div>
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
                          className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 pl-10 text-sm text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none"
                      />
                      <svg className="absolute left-3 top-4 w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      
                      {unSearchQuery && unSearchResults.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-amber-500/30 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto custom-scrollbar">
                              {unSearchResults.map((item, idx) => (
                                  <button
                                      key={idx}
                                      onClick={() => selectScenario(item)}
                                      className="w-full text-left px-4 py-4 border-b border-white/5 last:border-0 hover:bg-amber-500/10 flex flex-col gap-1 active:bg-amber-500/20"
                                  >
                                      <div className="flex justify-between">
                                          <span className="text-sm font-bold text-white">{item.label}</span>
                                          <span className="text-xs font-mono text-amber-400">{item.radius}m</span>
                                      </div>
                                      <span className="text-xs text-slate-400">{item.info}</span>
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
                              flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border transition-all duration-300 touch-manipulation
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
                    className="w-full bg-slate-900/80 border border-white/10 hover:border-blue-500/50 hover:bg-blue-900/10 text-left text-xs rounded-xl p-4 flex justify-between items-center transition-all group shadow-md active:scale-[0.98]"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-slate-500 uppercase">Valt Scenario</span>
                      <span className={`truncate font-bold text-sm ${selectedScenarioLabel === "Anpassad radie" ? 'text-slate-300' : 'text-blue-300'}`}>
                          {selectedScenarioLabel}
                      </span>
                    </div>
                    <div className="bg-slate-800 p-2 rounded-lg text-slate-400 group-hover:text-white transition-colors">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
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
                          className="w-24 bg-transparent text-right font-mono text-white text-2xl font-bold tracking-tight focus:outline-none focus:border-b focus:border-white/20 p-0 m-0"
                        />
                        <span className="text-base text-slate-500 font-sans">m</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="3000" 
                      step="50"
                      value={radius}
                      onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
                      className="slider-red h-4"
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
                      <input type="range" min="0" max="1000" step="10" value={innerRadius} onChange={(e) => handleInnerRadiusChange(parseInt(e.target.value))} className="slider-amber h-4" />
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
                          <input type="range" min="0" max="360" step="5" value={windDirection} onChange={(e) => setWindDirection(parseInt(e.target.value))} className="slider-amber h-4" />
                      </div>
                    </div>
                    <button onClick={() => fetchWindData(currentMapCenter.lat, currentMapCenter.lng)} className="w-full py-3 text-xs uppercase font-bold text-amber-200/80 bg-white/5 rounded-lg active:bg-white/10">{isFetchingWeather ? 'Hämtar...' : 'Hämta Live Vinddata'}</button>
                  </div>
                )}

                {zoneCount > 0 && (
                  <div className="space-y-3 mt-4 pt-4 border-t border-white/10 pb-8">
                    {onGenerateBreakpoints && <button onClick={onGenerateBreakpoints} disabled={isGeneratingBreakpoints} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-4 text-white font-bold text-xs uppercase shadow-lg active:scale-[0.98] transition-transform">{isGeneratingBreakpoints ? 'Genererar...' : 'Generera Brytpunkter'}</button>}
                    {onFetchRoads && <button onClick={onFetchRoads} disabled={isFetchingRoads} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 text-white font-bold text-xs uppercase shadow-lg active:scale-[0.98] transition-transform">{isFetchingRoads ? 'Hämtar...' : 'Markera Stora Vägar (5km)'}</button>}
                  </div>
                )}
            </div>
            
            {/* Footer */}
            <div className="bg-slate-900/60 p-4 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-slate-500/80 shrink-0 mb-safe-area">
                <span>ZONER: {zoneCount}</span>
                <button 
                  onClick={onOpenHAIntegration}
                  className="text-blue-400 hover:text-white transition-colors uppercase font-bold px-4 py-2"
                >
                  HA INTEGRATION
                </button>
            </div>
        </div>
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