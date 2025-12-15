import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import SecurityMap from './components/SecurityMap';
import ControlPanel from './components/ControlPanel';
import TopBar from './components/TopBar';
import ZoneList from './components/ZoneList';
import HAIntegrationModal from './components/HAIntegrationModal';
import MOBTimeInputModal from './components/MOBTimeInputModal';
import LoginScreen from './components/LoginScreen';
import UnitSelectionScreen from './components/UnitSelectionScreen';
import { Zone, MapType, SearchLocation, MapCenter, TacticalMarker, RoadPath, ToolType, WindData } from './types';
import { DEFAULT_CENTER } from './constants';
import { StorageService } from './services/storage';

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Helper to format address nicely
const formatAddress = (result: any): string => {
  if (!result) return "Okänd plats";
  const route = result.address_components?.find((c: any) => c.types.includes('route'))?.long_name;
  const streetNumber = result.address_components?.find((c: any) => c.types.includes('street_number'))?.long_name;
  if (route && streetNumber) return `${route} ${streetNumber}`;
  if (route) return route;
  return result.formatted_address.split(',')[0];
};

const LIBRARIES: ("places" | "drawing" | "geometry" | "localContext" | "visualization")[] = ["places", "geometry"];

const SystemErrorScreen: React.FC<{ message: string; detail?: string }> = ({ message, detail }) => (
  <div className="w-screen h-screen flex items-center justify-center bg-slate-900 text-slate-300 p-6">
    <div className="bg-slate-800 p-8 rounded-lg shadow-2xl max-w-lg border border-red-900/50">
       <div className="flex items-center gap-3 text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold font-mono">SYSTEM ERROR</h2>
       </div>
       <p className="text-sm mb-4 font-mono text-white">{message}</p>
       {detail && <p className="text-xs text-slate-500 mb-6 border-l-2 border-slate-600 pl-3 py-1">{detail}</p>}
    </div>
  </div>
);

// --- DASHBOARD COMPONENT ---
// Receives unitId to segregate data
const Dashboard: React.FC<{ apiKey: string; unitId: string; unitName: string; onBack: () => void }> = ({ apiKey, unitId, unitName, onBack }) => {
  // --- STATE ---
  const [zones, setZones] = useState<Zone[]>([]);
  const [markers, setMarkers] = useState<TacticalMarker[]>([]);

  // Subscribe to Data via Storage Service
  useEffect(() => {
    // This handles both Realtime Firebase updates AND LocalStorage polling
    const unsubscribeZones = StorageService.subscribeToZones(unitId, (data) => setZones(data));
    const unsubscribeMarkers = StorageService.subscribeToMarkers(unitId, (data) => setMarkers(data));

    return () => {
        unsubscribeZones();
        unsubscribeMarkers();
    };
  }, [unitId]);

  const [radius, setRadius] = useState<number>(500);
  const [innerRadius, setInnerRadius] = useState<number>(50);
  const [activeTool, setActiveTool] = useState<ToolType>('none');
  const [roadPaths, setRoadPaths] = useState<RoadPath[]>([]);
  const [mapType, setMapType] = useState<MapType>('terrain');
  const [showZones, setShowZones] = useState<boolean>(true);
  const [searchLocation, setSearchLocation] = useState<SearchLocation | null>(null);
  const [isGeneratingBreakpoints, setIsGeneratingBreakpoints] = useState(false);
  const [isFetchingRoads, setIsFetchingRoads] = useState(false);
  const [currentMapCenter, setCurrentMapCenter] = useState<MapCenter>(DEFAULT_CENTER);
  const [activeZoneType, setActiveZoneType] = useState<'circle' | 'sector' | 'keyhole'>('circle');
  const [windDirection, setWindDirection] = useState<number>(0);
  const [windSpeed, setWindSpeed] = useState<number>(0); 
  const [isHAOpen, setIsHAOpen] = useState(false);
  const [isMOBModalOpen, setIsMOBModalOpen] = useState(false);
  const [pendingMOBLocation, setPendingMOBLocation] = useState<{lat: number, lng: number} | null>(null);
  const [authError, setAuthError] = useState(false);
  const hasWarmZone = true;
  const mapRef = useRef<any | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
    preventGoogleFontsLoading: true
  });

  useEffect(() => {
    const handleAuthFailure = () => { console.error("Google Maps Auth Failure"); setAuthError(true); };
    (window as any).gm_authFailure = handleAuthFailure;
    return () => { (window as any).gm_authFailure = undefined; };
  }, []);

  const handleMapLoad = useCallback((map: any) => { mapRef.current = map; }, []);
  const handleCenterChanged = useCallback((center: MapCenter) => { setCurrentMapCenter(center); }, []);
  
  const fetchAddress = useCallback((lat: number, lng: number, callback: (addr: string) => void) => {
      if ((window as any).google) {
          const geocoder = new (window as any).google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
              if (status === 'OK' && results[0]) callback(formatAddress(results[0]));
              else callback("Adress okänd");
          });
      }
  }, []);

  const handleAddMarker = useCallback((lat: number, lng: number, label: string, type: TacticalMarker['type'] = 'breakpoint', createdAt?: number) => {
    const newMarker: TacticalMarker = { id: generateId(), lat, lng, type, label, createdAt: createdAt || Date.now() };
    // Optimistic UI can be added here, but StorageService is fast enough locally
    StorageService.addMarker(unitId, newMarker);
    if (mapRef.current) mapRef.current.panTo({ lat, lng });
  }, [unitId]);

  const handleCreateZoneAtPoint = useCallback((lat: number, lng: number) => {
    const newId = generateId();
    const newZone: Zone = {
      id: newId, lat, lng, radius, innerRadius: activeZoneType === 'keyhole' ? innerRadius : undefined,
      timestamp: Date.now(), type: activeZoneType, bearing: (activeZoneType === 'sector' || activeZoneType === 'keyhole') ? windDirection : undefined,
      hasWarmZone: hasWarmZone
    };
    
    // Add zone
    StorageService.addZone(unitId, newZone);

    // Async update address
    fetchAddress(lat, lng, (addr) => { 
        StorageService.updateZone(unitId, newId, { address: addr });
    });
  }, [radius, innerRadius, activeZoneType, windDirection, hasWarmZone, fetchAddress, unitId]);

  const handleMapClick = useCallback((e: any) => {
    if (activeTool === 'none' || !e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    if (activeTool === 'zone') {
        handleCreateZoneAtPoint(lat, lng);
        setActiveTool('none');
    } else {
        if (activeTool === 'mob') {
             setPendingMOBLocation({ lat, lng });
             setIsMOBModalOpen(true);
             setActiveTool('none');
             return;
        }
        const newId = generateId();
        const newMarker: TacticalMarker = { id: newId, lat, lng, type: activeTool, label: 'Hämtar adress...', createdAt: Date.now() };
        StorageService.addMarker(unitId, newMarker);
        
        fetchAddress(lat, lng, (addr) => { 
             // We need to re-find the marker by ID via the service, but since we don't have updateMarker, we assume list updates.
             // Actually, to update a marker label after fetch, we need a method or delete/add.
             // For simplicity, let's delete and add or implement updateMarker.
             // Better: Just use Add (Overwrite in Firestore if ID matches, or simple replace).
             // Since StorageService.addMarker uses setDoc (upsert) in firebase and array push in local, we need to handle local storage update better or use a dedicated update.
             // For this demo, we'll re-add it with same ID which might dupe in local storage array logic if not careful.
             // Let's implement delete then add for safety in local, or add updateMarker to service. 
             // Simplest for now: Delete then Add with address.
             StorageService.deleteMarker(unitId, newId);
             StorageService.addMarker(unitId, { ...newMarker, label: addr });
        });
    }
  }, [activeTool, handleCreateZoneAtPoint, fetchAddress, unitId]);

  const handleConfirmMOB = (timestamp: number) => {
      if (!pendingMOBLocation) return;
      const timeStr = new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      const newId = generateId();
      const newMarker: TacticalMarker = { id: newId, lat: pendingMOBLocation.lat, lng: pendingMOBLocation.lng, type: 'mob', label: `MOB - ${timeStr}`, createdAt: timestamp };
      
      StorageService.addMarker(unitId, newMarker);
      
      fetchAddress(pendingMOBLocation.lat, pendingMOBLocation.lng, (addr) => {
            StorageService.deleteMarker(unitId, newId);
            StorageService.addMarker(unitId, { ...newMarker, label: `MOB - ${timeStr} (${addr})` });
      });
      setPendingMOBLocation(null);
      setIsMOBModalOpen(false);
  };

  const handlePlaceAtCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) { alert("Geolokalisering stöds inte."); return; }
    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        if (activeTool === 'zone') {
          handleCreateZoneAtPoint(latitude, longitude);
          setActiveTool('none');
        } else if (activeTool !== 'none') {
           if (activeTool === 'mob') {
              setPendingMOBLocation({ lat: latitude, lng: longitude });
              setIsMOBModalOpen(true);
              setActiveTool('none');
              if (mapRef.current) { mapRef.current.panTo({ lat: latitude, lng: longitude }); mapRef.current.setZoom(16); }
              return;
           }
           const newId = generateId();
           const newMarker: TacticalMarker = { id: newId, lat: latitude, lng: longitude, type: activeTool, label: 'Min GPS-position', createdAt: Date.now() };
           StorageService.addMarker(unitId, newMarker);

           fetchAddress(latitude, longitude, (addr) => {
              StorageService.deleteMarker(unitId, newId);
              StorageService.addMarker(unitId, { ...newMarker, label: addr + " (GPS)" });
           });
        }
        if (mapRef.current) { mapRef.current.panTo({ lat: latitude, lng: longitude }); mapRef.current.setZoom(16); }
      },
      (error) => { alert("Kunde inte hämta din position."); }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [activeTool, handleCreateZoneAtPoint, handleAddMarker, fetchAddress, unitId]);

  const handleMapRightClick = useCallback(() => { if (activeTool !== 'none') setActiveTool('none'); }, [activeTool]);
  const handleDeleteZone = useCallback((id: string) => { StorageService.deleteZone(unitId, id); }, [unitId]);
  const handleDeleteMarker = useCallback((id: string) => { StorageService.deleteMarker(unitId, id); }, [unitId]);
  const handleZoneUpdate = useCallback((id: string, updates: Partial<Zone>) => { StorageService.updateZone(unitId, id, updates); }, [unitId]);
  const clearZones = useCallback(() => { if (window.confirm("Rensa allt för denna enhet?")) { StorageService.clearAll(unitId); setSearchLocation(null); } }, [unitId]);

  const handleFetchRoads = useCallback(async () => {
    if (zones.length === 0) { alert("Skapa en zon först."); return; }
    setIsFetchingRoads(true);
    const targetZone = zones[zones.length - 1];
    const query = `[out:json];(way["highway"~"motorway|trunk|primary|secondary"](around:5000,${targetZone.lat},${targetZone.lng}););(._;>;);out body;`;
    try {
      const response = await fetch("https://overpass-api.de/api/interpreter", { method: "POST", body: query });
      if (!response.ok) throw new Error("Fel vid hämtning");
      const data = await response.json();
      const nodesMap = new Map();
      data.elements.forEach((el: any) => { if (el.type === 'node') nodesMap.set(el.id, { lat: el.lat, lng: el.lon }); });
      const newPaths: RoadPath[] = [];
      data.elements.forEach((el: any) => {
        if (el.type === 'way' && el.nodes) {
          const path = el.nodes.map((nodeId: number) => nodesMap.get(nodeId)).filter(Boolean);
          if (path.length > 1) newPaths.push(path);
        }
      });
      if (newPaths.length === 0) alert("Inga vägar hittades.");
      else { setRoadPaths(newPaths); if (mapRef.current) mapRef.current.setZoom(12); }
    } catch (error) { alert("Fel vid hämtning."); } finally { setIsFetchingRoads(false); }
  }, [zones]);

  const handleGenerateBreakpoints = useCallback(async () => {
    if (zones.length === 0) { alert("Skapa zon först."); return; }
    if (!mapRef.current || !(window as any).google) return;
    setIsGeneratingBreakpoints(true);
    const targetZone = zones[zones.length - 1];
    const zoneCenter = new (window as any).google.maps.LatLng(targetZone.lat, targetZone.lng);
    const service = new (window as any).google.maps.places.PlacesService(mapRef.current);
    const searchBearings = [0, 120, 240];
    const typesToSearch = ['gas_station', 'parking', 'transit_station'];
    const searchPromises: Promise<any[]>[] = [];
    searchBearings.forEach(bearing => {
        const edgePoint = (window as any).google.maps.geometry.spherical.computeOffset(zoneCenter, targetZone.radius, bearing);
        typesToSearch.forEach(type => {
            searchPromises.push(new Promise<any[]>((resolve) => {
                service.nearbySearch({ location: edgePoint, rankBy: (window as any).google.maps.places.RankBy.DISTANCE, type: type }, 
                (results: any[], status: any) => { resolve((status === (window as any).google.maps.places.PlacesServiceStatus.OK && results) ? results : []); });
            }));
        });
    });
    try {
        const resultsArray = await Promise.all(searchPromises);
        const uniquePlaces = Array.from(new Map(resultsArray.flat().map(item => [item.place_id, item])).values());
        const candidates = uniquePlaces.map((place: any) => {
            if (!place.geometry?.location) return null;
            const dist = (window as any).google.maps.geometry.spherical.computeDistanceBetween(zoneCenter, place.geometry.location);
            if (dist <= targetZone.radius + 10) return null;
            return { ...place, distanceToEdge: dist - targetZone.radius };
          }).filter((p): p is any => p !== null).sort((a, b) => a.distanceToEdge - b.distanceToEdge).slice(0, 6);
        if (candidates.length === 0) { alert("Inga punkter hittades."); return; }
        const newMarkers: TacticalMarker[] = candidates.map((place: any, index: number) => ({
          id: generateId(), lat: place.geometry.location.lat(), lng: place.geometry.location.lng(), type: 'breakpoint', label: place.name || `BP ${index + 1}`
        }));
        // Batch add via service
        newMarkers.forEach(m => StorageService.addMarker(unitId, m));
        
    } catch (e) { console.error(e); } finally { setIsGeneratingBreakpoints(false); }
  }, [zones, unitId]);

  const handlePlaceSelected = useCallback((place: any) => {
    if (place.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setSearchLocation({ lat, lng, address: place.formatted_address || "Okänd plats" });
      if (mapRef.current) { mapRef.current.panTo({ lat, lng }); mapRef.current.setZoom(15); }
    }
  }, []);

  if (authError) return <SystemErrorScreen message="Auth Failure" />;
  if (loadError) return <SystemErrorScreen message="Load Error" detail={loadError.message} />;
  if (!isLoaded) return <div className="w-screen h-screen flex items-center justify-center bg-slate-900 text-slate-400"><span className="animate-pulse">INITIERAR KARTDATA...</span></div>;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-900">
      {/* Unit Badge Overlay */}
      <div className="absolute top-20 left-4 z-20 pointer-events-none md:top-4 md:left-24">
        <div className="bg-slate-900/80 backdrop-blur border border-blue-500/30 text-blue-400 px-3 py-1 rounded text-[10px] font-mono font-bold uppercase shadow-lg">
           AKTIV ENHET: {unitName}
        </div>
      </div>
      
      {/* Back Button Overlay */}
      <div className="absolute top-20 left-4 md:top-4 md:left-4 z-30">
         <button onClick={onBack} className="bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg shadow-lg border border-white/10 transition-colors" title="Byt Enhet">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
               <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
         </button>
      </div>

      <div className="absolute inset-0 z-0">
        <SecurityMap 
          zones={zones} markers={markers} roadPaths={roadPaths} onMapClick={handleMapClick} onMapRightClick={handleMapRightClick} isPlacingMode={activeTool !== 'none'} mapType={mapType} showZones={showZones}
          onZoneDelete={handleDeleteZone} onMarkerDelete={handleDeleteMarker} onZoneUpdate={handleZoneUpdate} searchLocation={searchLocation} onLoad={handleMapLoad} onCenterChanged={handleCenterChanged}
          previewRadius={radius} previewInnerRadius={innerRadius} previewType={activeZoneType} previewBearing={windDirection} previewHasWarmZone={hasWarmZone} activeTool={activeTool} windDirection={windDirection} windSpeed={windSpeed}
        />
      </div>
      <TopBar 
        onPlaceSelected={handlePlaceSelected} mapType={mapType} setMapType={setMapType} showZones={showZones} setShowZones={setShowZones} onCreateZone={(lat, lng) => handleCreateZoneAtPoint(lat, lng)} 
        zones={zones} markers={markers} onDeleteZone={handleDeleteZone} onDeleteMarker={handleDeleteMarker}
      />
      <ControlPanel 
            radius={radius} setRadius={setRadius} innerRadius={innerRadius} setInnerRadius={setInnerRadius} zoneCount={zones.length} activeZoneType={activeZoneType} setActiveZoneType={setActiveZoneType}
            windDirection={windDirection} setWindDirection={setWindDirection} currentMapCenter={currentMapCenter} onGenerateBreakpoints={handleGenerateBreakpoints} isGeneratingBreakpoints={isGeneratingBreakpoints}
            markers={markers} onAddMarker={handleAddMarker} onFetchRoads={handleFetchRoads} isFetchingRoads={isFetchingRoads} onOpenHAIntegration={() => setIsHAOpen(true)} activeTool={activeTool} setActiveTool={setActiveTool} onPlaceAtCurrentLocation={handlePlaceAtCurrentLocation}
      />
      <ZoneList zones={zones} onDeleteZone={handleDeleteZone} />
      <HAIntegrationModal isOpen={isHAOpen} onClose={() => setIsHAOpen(false)} markers={markers} zones={zones} />
      <MOBTimeInputModal isOpen={isMOBModalOpen} onClose={() => { setIsMOBModalOpen(false); setPendingMOBLocation(null); }} onSubmit={handleConfirmMOB} />
      <div className="hidden md:block absolute bottom-4 right-4 z-10">
          {(zones.length > 0 || markers.length > 0) && (
            <button onClick={clearZones} className="bg-slate-800/80 hover:bg-red-900/80 text-slate-400 hover:text-red-200 border border-slate-700 px-3 py-1 rounded text-xs font-mono transition-colors backdrop-blur-sm shadow-lg">RENSA ENHETSDATA</button>
          )}
      </div>
    </div>
  );
};

// --- APP COMPONENT ---
export default function App() {
  const apiKey = "AIzaSyBmCJe2qmpJ14Xv6qLzhH0A2v4iWdcdL0Q";
  
  // App View State
  const [view, setView] = useState<'login' | 'units' | 'map'>('login');
  const [username, setUsername] = useState<string>('');
  const [currentUnit, setCurrentUnit] = useState<{id: string, name: string} | null>(null);

  const handleLogin = (user: string) => {
      setUsername(user);
      setView('units');
  };

  const handleLogout = () => {
      setUsername('');
      setCurrentUnit(null);
      setView('login');
  };

  const handleSelectUnit = (unitId: string, unitName: string) => {
      setCurrentUnit({ id: unitId, name: unitName });
      setView('map');
  };

  const handleBackToUnits = () => {
      setCurrentUnit(null);
      setView('units');
  };

  return (
    <>
      {view === 'login' && <LoginScreen onLogin={handleLogin} />}
      
      {view === 'units' && (
        <UnitSelectionScreen 
            username={username} 
            onSelectUnit={handleSelectUnit} 
            onLogout={handleLogout} 
        />
      )}
      
      {view === 'map' && currentUnit && (
        // Key is crucial here: it forces Dashboard to remount (and reload from localStorage) when unit changes
        <Dashboard 
            key={currentUnit.id} 
            apiKey={apiKey} 
            unitId={currentUnit.id} 
            unitName={currentUnit.name}
            onBack={handleBackToUnits}
        />
      )}
    </>
  );
}