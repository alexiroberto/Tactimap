import React, { useState, useRef, useEffect } from 'react';
import { MapType, Zone, TacticalMarker } from '../types';
import AddressList from './AddressList';

interface TopBarProps {
  onPlaceSelected: (place: any) => void;
  mapType: MapType;
  setMapType: (type: MapType) => void;
  showZones: boolean;
  setShowZones: (show: boolean) => void;
  onCreateZone?: (lat: number, lng: number) => void;
  zones: Zone[];
  markers: TacticalMarker[];
  onDeleteZone: (id: string) => void;
  onDeleteMarker: (id: string) => void;
}

// Bounds for Greater Stockholm area to bias results
const STOCKHOLM_BOUNDS = {
  north: 59.60,
  south: 59.00,
  west: 17.60,
  east: 18.60,
};

const TopBar: React.FC<TopBarProps> = ({ 
  onPlaceSelected, 
  mapType, 
  setMapType,
  showZones,
  setShowZones,
  onCreateZone,
  zones,
  markers,
  onDeleteZone,
  onDeleteMarker
}) => {
  const [streetValue, setStreetValue] = useState<string>(""); // input_select.vald_gatuadress
  const [houseNumber, setHouseNumber] = useState<string>(""); // input_text.husnummer
  const [addressContext, setAddressContext] = useState<string>(""); // Hidden context (City/Country)
  
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const numberInputRef = useRef<HTMLInputElement>(null);
  const autocompleteService = useRef<any>(null);

  // Initialize Services
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).google && !autocompleteService.current) {
      autocompleteService.current = new (window as any).google.maps.places.AutocompleteService();
    }
  }, []);

  // Handle Street Input Change & Fetch Predictions
  const handleStreetChange = (value: string) => {
    setStreetValue(value);
    // If user types manually, clear the hidden context to avoid mismatch
    setAddressContext(""); 
    
    if (!value.trim() || !autocompleteService.current) {
      setPredictions([]);
      setShowSuggestions(false);
      return;
    }

    const request = {
      input: value,
      bounds: STOCKHOLM_BOUNDS,
      componentRestrictions: { country: "se" },
      types: ['geocode'] // Favor addresses/streets over businesses
    };

    autocompleteService.current.getPlacePredictions(request, (results: any[], status: any) => {
      if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && results) {
        setPredictions(results);
        setShowSuggestions(true);
      } else {
        setPredictions([]);
        setShowSuggestions(false);
      }
    });
  };

  // Handle Selection from Dropdown (Street only)
  const handleSelectPrediction = (prediction: any) => {
    // 1. Set the Visible Input to just the main text (e.g., "Sveavägen")
    setStreetValue(prediction.structured_formatting.main_text);
    
    // 2. Store the Secondary Text (e.g., "Stockholm, Sverige") for the search context
    setAddressContext(prediction.structured_formatting.secondary_text || "");
    
    setShowSuggestions(false);
    numberInputRef.current?.focus(); // Move focus to number input automatically
  };

  // LOGIK: Hämta Position (Action = 'search' eller 'place')
  const handleFetchPosition = (action: 'search' | 'place' = 'search') => {
    if (!streetValue || !(window as any).google) return;
    setShowSuggestions(false);
    
    // 1. Smart Sammanslagning Logic
    let searchString = streetValue.trim();

    // Om vi har en sparad kontext (från dropdown-val), använd den för att bygga en strikt sträng.
    // Format: "Gata Nummer, Stad, Land"
    if (addressContext) {
      if (houseNumber.trim()) {
        searchString = `${streetValue.trim()} ${houseNumber.trim()}, ${addressContext}`;
      } else {
        searchString = `${streetValue.trim()}, ${addressContext}`;
      }
    } else {
      // Manuell inmatning (användaren valde inte från listan)
      // Vi lägger bara på numret på slutet om det finns.
      if (houseNumber.trim()) {
        searchString = `${streetValue.trim()} ${houseNumber.trim()}`;
      }
    }

    console.log("Geocoding Query:", searchString);

    // 2. Geokodning
    const geocoder = new (window as any).google.maps.Geocoder();
    
    geocoder.geocode({ 
      address: searchString,
      componentRestrictions: { country: "se" } // Force Sweden results
    }, (results: any, status: any) => {
      if (status === 'OK' && results && results[0]) {
        const result = results[0];
        
        // 3. Output / Uppdatera
        const place = {
          geometry: result.geometry,
          formatted_address: result.formatted_address,
          place_id: result.place_id,
          name: searchString 
        };
        
        // Pan and mark map
        onPlaceSelected(place);

        // If action is 'place', create zone
        if (action === 'place' && onCreateZone && result.geometry.location) {
             onCreateZone(result.geometry.location.lat(), result.geometry.location.lng());
        }

        // Feedback
        console.log(`Plats uppdaterad: ${result.formatted_address}`);
        
        // Blur inputs to hide keyboard on mobile
        inputRef.current?.blur();
        numberInputRef.current?.blur();

      } else {
        // Försök en gång till utan husnummer om det misslyckades, ibland finns inte numret exakt
        if (houseNumber.trim()) {
             console.log("Retrying without number...");
             const fallbackString = addressContext ? `${streetValue.trim()}, ${addressContext}` : streetValue.trim();
             geocoder.geocode({ address: fallbackString, componentRestrictions: { country: "se" } }, (res: any, stat: any) => {
                if (stat === 'OK' && res && res[0]) {
                     const fallbackPlace = {
                        ...res[0],
                        name: fallbackString + " (Nummer saknas)"
                     };
                     onPlaceSelected(fallbackPlace);
                     
                     if (action === 'place' && onCreateZone && res[0].geometry.location) {
                        onCreateZone(res[0].geometry.location.lat(), res[0].geometry.location.lng());
                     }

                     alert(`Hittade inte exakt nummer ${houseNumber}, visar gatan istället.`);
                     inputRef.current?.blur();
                } else {
                    alert("Kunde inte hitta platsen. Kontrollera stavning.");
                }
             });
        } else {
            alert("Kunde inte hitta platsen. Kontrollera adressen.");
        }
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFetchPosition('search'); // Default to search on Enter
      inputRef.current?.blur();
      numberInputRef.current?.blur();
    }
  };

  return (
    <div className="absolute top-4 left-4 right-4 z-20 flex flex-col items-stretch pointer-events-none gap-2 md:flex-row md:items-start md:justify-end">
      
      {/* Search Bar Container */}
      <div className={`
        pointer-events-auto flex flex-col gap-2 transition-all duration-300 relative shrink-0 order-1
        md:w-[400px] md:ml-auto
        ${isFocused ? 'w-full scale-[1.01]' : 'w-full'}
      `}> 
        
        {/* The Search Capsule */}
        <div className="relative group w-full shadow-2xl rounded-2xl md:rounded-full z-30">
           {/* Background Blur Container */}
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl rounded-2xl md:rounded-full border border-white/10"></div>
          
          <div className="relative flex items-center h-14 md:h-12">
            {/* Icon */}
            <div className="pl-4 flex items-center pointer-events-none text-slate-400">
              <svg className={`h-5 w-5 transition-colors ${isFocused ? 'text-blue-400' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            
            {/* Input 1: Street */}
            <input
              ref={inputRef}
              type="text"
              value={streetValue}
              onFocus={() => { setIsFocused(true); if(predictions.length) setShowSuggestions(true); }}
              onBlur={() => { setIsFocused(false); setTimeout(() => setShowSuggestions(false), 200); }}
              onChange={(e) => handleStreetChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Gata / Plats..."
              className="flex-1 h-full bg-transparent text-slate-200 placeholder-slate-500 border-none focus:ring-0 text-base md:text-sm font-medium pl-3 pr-2 rounded-l-full font-mono outline-none min-w-0"
            />
            
            {/* Divider */}
            <div className="h-6 w-px bg-white/10 mx-1"></div>

            {/* Input 2: Number */}
            <input
              ref={numberInputRef}
              type="number"
              value={houseNumber}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => setHouseNumber(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nr"
              className="w-14 h-full bg-transparent text-center text-slate-200 placeholder-slate-600 border-none focus:ring-0 text-base md:text-sm font-bold font-mono outline-none"
            />

            {/* Divider */}
            <div className="h-6 w-px bg-white/10 mx-1"></div>

            {/* Button: Fetch */}
            <button 
              onClick={() => handleFetchPosition('search')}
              className="ml-1 p-2 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-full transition-all duration-300 flex items-center justify-center shadow-lg w-10 h-10"
              title="Sök plats"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Button: Place Zone */}
            <button 
              onClick={() => handleFetchPosition('place')}
              className="mr-1.5 ml-1 p-2 bg-slate-800 hover:bg-red-600 text-red-400 hover:text-white rounded-full transition-all duration-300 flex items-center justify-center shadow-lg w-10 h-10"
              title="Sätt zon på adress"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Custom Suggestions Dropdown */}
        {showSuggestions && predictions.length > 0 && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in-down max-h-[40vh] overflow-y-auto">
            <ul className="py-1">
              {predictions.map((prediction) => (
                <li 
                  key={prediction.place_id}
                  onClick={() => handleSelectPrediction(prediction)}
                  className="px-4 py-4 cursor-pointer transition-colors flex items-center justify-between border-b border-white/5 last:border-0 hover:bg-white/5 active:bg-blue-600/20"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 rounded-full flex-shrink-0 bg-slate-800 text-slate-400">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                       </svg>
                    </div>
                    
                    <div className="flex flex-col min-w-0">
                      <span className="text-base font-medium text-slate-200 truncate">
                        {prediction.structured_formatting.main_text}
                      </span>
                      <span className="text-xs text-slate-500 truncate">
                        {prediction.structured_formatting.secondary_text}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Control Pills Row - Wraps on mobile */}
      <div className="pointer-events-auto flex items-center gap-2 shrink-0 order-2 flex-wrap justify-end">
        
        {/* Address List Toggle (Integrated into TopBar) */}
        <AddressList 
            zones={zones}
            markers={markers}
            onDeleteZone={onDeleteZone}
            onDeleteMarker={onDeleteMarker}
        />

        {/* Map Type Pill */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl p-1 pr-3 relative group hover:border-white/20 transition-all">
          <div className="flex items-center">
            <div className="p-2 bg-slate-800 rounded-full text-slate-400 mr-1 md:mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <select
              value={mapType}
              onChange={(e) => setMapType(e.target.value as MapType)}
              className="bg-transparent text-slate-300 text-xs font-bold uppercase tracking-wider focus:outline-none cursor-pointer appearance-none pr-6 max-w-[80px] md:max-w-none truncate"
            >
              <option value="roadmap">Karta</option>
              <option value="satellite">Satellit</option>
              <option value="hybrid">Hybrid</option>
              <option value="terrain">Terräng</option>
            </select>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-500">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        {/* Zone Toggle Pill */}
        <button 
          onClick={() => setShowZones(!showZones)}
          className={`
             h-12 px-4 rounded-full text-xs font-bold tracking-wider transition-all flex items-center gap-2 shadow-2xl border
             ${showZones 
                ? 'bg-gradient-to-r from-red-600/90 to-red-500/90 text-white border-red-400/20 shadow-glow-red' 
                : 'bg-slate-900/80 backdrop-blur-xl text-slate-400 border-white/10 hover:bg-slate-800'}
          `}
        >
          {showZones ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-slate-500"></div>
          )}
          <span className="hidden md:inline">ZONER</span>
        </button>
      </div>
    </div>
  );
};

export default TopBar;