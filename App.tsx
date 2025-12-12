import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import SecurityMap from './components/SecurityMap';
import ControlPanel from './components/ControlPanel';
import KeyInputModal from './components/KeyInputModal';
import TopBar from './components/TopBar';
import HAIntegrationModal from './components/HAIntegrationModal';
// AddressList is now used inside TopBar, no longer imported here directly unless needed for types but props are handled in TopBar
import { Zone, MapType, SearchLocation, MapCenter, TacticalMarker, RoadPath, ToolType } from './types';
import { DEFAULT_CENTER } from './constants';

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Helper to format address nicely (Street + Number)
const formatAddress = (result: any): string => {
  if (!result) return "Okänd plats";
  
  // Try to find specific address components
  const route = result.address_components?.find((c: any) => c.types.includes('route'))?.long_name;
  const streetNumber = result.address_components?.find((c: any) => c.types.includes('street_number'))?.long_name;

  if (route && streetNumber) {
    return `${route} ${streetNumber}`;
  }
  if (route) {
    return route;
  }
  
  // Fallback to the first part of the formatted address (usually street, city)
  return result.formatted_address.split(',')[0];
};

// Libraries must be defined outside component to prevent infinite re-renders
// Added 'geometry' for distance calculations
const LIBRARIES: ("places" | "drawing" | "geometry" | "localContext" | "visualization")[] = ["places", "geometry"];

// Inner component that handles the Map and API Loading
const Dashboard: React.FC<{ apiKey: string; onResetKey: () => void }> = ({ apiKey, onResetKey }) => {
  // Application State
  const [radius, setRadius] = useState<number>(500);
  const [innerRadius, setInnerRadius] = useState<number>(50); // For Keyhole
  
  // Tool State
  const [activeTool, setActiveTool] = useState<ToolType>('none');
  
  const [zones, setZones] = useState<Zone[]>([]);
  const [markers, setMarkers] = useState<TacticalMarker[]>([]);
  const [roadPaths, setRoadPaths] = useState<RoadPath[]>([]); // New state for roads
  
  // New State Features
  const [mapType, setMapType] = useState<MapType>('terrain');
  const [showZones, setShowZones] = useState<boolean>(true);
  const [searchLocation, setSearchLocation] = useState<SearchLocation | null>(null);
  const [isGeneratingBreakpoints, setIsGeneratingBreakpoints] = useState(false);
  const [isFetchingRoads, setIsFetchingRoads] = useState(false);

  // Map Center State (for weather api)
  const [currentMapCenter, setCurrentMapCenter] = useState<MapCenter>(DEFAULT_CENTER);

  // Gas/Sector specific state
  const [activeZoneType, setActiveZoneType] = useState<'circle' | 'sector' | 'keyhole'>('circle');
  const [windDirection, setWindDirection] = useState<number>(0); // 0-360 degrees
  
  // HA Integration State
  const [isHAOpen, setIsHAOpen] = useState(false);
  
  // Auth Error State
  const [authError, setAuthError] = useState(false);

  // Hazmat / Warm Zone State
  // CHANGED: Always TRUE. No toggle allowed.
  const hasWarmZone = true;

  // Map Reference
  const mapRef = useRef<any | null>(null);

  // API Loader
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES
  });

  // Handle Google Maps Auth Failure (Invalid Key)
  useEffect(() => {
    (window as any).gm_authFailure = () => {
      console.error("Google Maps Authentication Failure detected.");
      setAuthError(true);
    };

    return () => {
      (window as any).gm_authFailure = undefined;
    };
  }, []);

  const handleMapLoad = useCallback((map: any) => {
    mapRef.current = map;
  }, []);

  const handleCenterChanged = useCallback((center: MapCenter) => {
    setCurrentMapCenter(center);
  }, []);

  // Helper to fetch address
  const fetchAddress = useCallback((lat: number, lng: number, callback: (addr: string) => void) => {
      if ((window as any).google) {
          const geocoder = new (window as any).google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
              if (status === 'OK' && results[0]) {
                  callback(formatAddress(results[0]));
              } else {
                  callback("Adress okänd");
              }
          });
      }
  }, []);

  // Handler for LEFT CLICK on map (Placement based on activeTool)
  const handleMapClick = useCallback((e: any) => {
    if (activeTool === 'none' || !e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    if (activeTool === 'zone') {
        const newId = generateId();
        const newZone: Zone = {
          id: newId,
          lat: lat,
          lng: lng,
          radius: radius,
          innerRadius: activeZoneType === 'keyhole' ? innerRadius : undefined,
          timestamp: Date.now(),
          type: activeZoneType,
          bearing: (activeZoneType === 'sector' || activeZoneType === 'keyhole') ? windDirection : undefined,
          hasWarmZone: hasWarmZone // Always true
        };
        setZones(prev => [...prev, newZone]);
        
        // Fetch Address for Zone Center
        fetchAddress(lat, lng, (addr) => {
            setZones(prev => prev.map(z => z.id === newId ? { ...z, address: addr } : z));
        });

        // DESELECT TOOL AFTER PLACING ZONE
        setActiveTool('none');

    } else {
        // Place Marker (breakpoint, assembly, decon, command)
        const newId = generateId();
        const newMarker: TacticalMarker = {
          id: newId,
          lat: lat,
          lng: lng,
          type: activeTool, 
          label: 'Hämtar adress...'
        };
        setMarkers(prev => [...prev, newMarker]);
        
        // Fetch Address
        fetchAddress(lat, lng, (addr) => {
             setMarkers(prev => prev.map(m => m.id === newId ? { ...m, label: addr } : m));
        });
        // We do NOT deselect markers automatically, allowing rapid placement of multiple markers.
    }

  }, [activeTool, radius, innerRadius, activeZoneType, windDirection, hasWarmZone, fetchAddress]);

  // Handler for creating a zone programmatically at specific coordinates (e.g. from Search)
  const handleCreateZoneAtPoint = useCallback((lat: number, lng: number) => {
    const newId = generateId();
    const newZone: Zone = {
      id: newId,
      lat: lat,
      lng: lng,
      radius: radius,
      innerRadius: activeZoneType === 'keyhole' ? innerRadius : undefined,
      timestamp: Date.now(),
      type: activeZoneType,
      bearing: (activeZoneType === 'sector' || activeZoneType === 'keyhole') ? windDirection : undefined,
      hasWarmZone: hasWarmZone
    };
    setZones(prev => [...prev, newZone]);
    
    fetchAddress(lat, lng, (addr) => {
        setZones(prev => prev.map(z => z.id === newId ? { ...z, address: addr } : z));
    });
  }, [radius, innerRadius, activeZoneType, windDirection, hasWarmZone, fetchAddress]);

  // Handler for Right Click (Keep functionality for "Quick Breakpoint" or remove?)
  // User asked to "place by clicking icon then left click".
  // Keeping this empty or basic to not conflict, or maybe purely for debugging.
  const handleMapRightClick = useCallback((e: any) => {
     // Optional: could handle something else here, or leave blank to strictly enforce tool usage.
  }, []);

  // Handler for manual marker addition (from ControlPanel Manual Input)
  const handleAddMarker = useCallback((lat: number, lng: number, label: string, type: TacticalMarker['type'] = 'breakpoint') => {
    const newMarker: TacticalMarker = {
      id: generateId(),
      lat: lat,
      lng: lng,
      type: type,
      label: label
    };
    
    setMarkers(prev => [...prev, newMarker]);

    // Pan map to new marker
    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
    }
  }, []);

  // Handler for Deleting Zones
  const handleDeleteZone = useCallback((id: string) => {
    setZones(prev => prev.filter(z => z.id !== id));
  }, []);

  // Handler for Deleting Markers
  const handleDeleteMarker = useCallback((id: string) => {
    setMarkers(prev => prev.filter(m => m.id !== id));
  }, []);

  // Handler for Updating Zones (Radius/Position)
  const handleZoneUpdate = useCallback((id: string, updates: Partial<Zone>) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, ...updates } : z));
  }, []);

  // --- NEW FEATURE: Fetch Major Roads via Overpass API ---
  const handleFetchRoads = useCallback(async () => {
    if (zones.length === 0) {
      alert("Skapa en säkerhetszon först för att definiera området.");
      return;
    }
    
    setIsFetchingRoads(true);
    const targetZone = zones[zones.length - 1]; // Use last zone
    const searchRadius = 5000; // 5km
    
    // Overpass QL Query: Get ways with highway tag = motorway, trunk, primary within 5000m
    const query = `
      [out:json];
      (
        way["highway"~"motorway|trunk|primary|secondary"](around:${searchRadius},${targetZone.lat},${targetZone.lng});
      );
      (._;>;);
      out body;
    `;

    try {
      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query
      });

      if (!response.ok) throw new Error("Kunde inte hämta vägdata.");

      const data = await response.json();
      
      // Parse Overpass Data
      // 1. Create a map of Nodes {id: {lat, lng}}
      const nodesMap = new Map();
      data.elements.forEach((el: any) => {
        if (el.type === 'node') {
          nodesMap.set(el.id, { lat: el.lat, lng: el.lon });
        }
      });

      // 2. Create Paths from Ways
      const newPaths: RoadPath[] = [];
      data.elements.forEach((el: any) => {
        if (el.type === 'way' && el.nodes) {
          const path = el.nodes.map((nodeId: number) => nodesMap.get(nodeId)).filter(Boolean);
          if (path.length > 1) {
            newPaths.push(path);
          }
        }
      });

      if (newPaths.length === 0) {
        alert("Inga större vägar hittades inom 5 km.");
      } else {
        setRoadPaths(newPaths);
        // Optional: Zoom out to show the 5km radius area
        if (mapRef.current) {
            mapRef.current.setZoom(12);
        }
      }

    } catch (error) {
      console.error(error);
      alert("Fel vid hämtning av vägdata.");
    } finally {
      setIsFetchingRoads(false);
    }
  }, [zones]);

  // Logic to generate breakpoints
  const handleGenerateBreakpoints = useCallback(async () => {
    if (zones.length === 0) {
      alert("Du måste skapa en säkerhetszon först.");
      return;
    }
    if (!mapRef.current || !(window as any).google) return;

    setIsGeneratingBreakpoints(true);

    // Use the most recently added zone
    const targetZone = zones[zones.length - 1];
    const zoneCenter = new (window as any).google.maps.LatLng(targetZone.lat, targetZone.lng);
    const service = new (window as any).google.maps.places.PlacesService(mapRef.current);

    // TACTICAL SEARCH STRATEGY: PERIMETER SCAN
    const searchBearings = [0, 120, 240];
    const typesToSearch = ['gas_station', 'parking', 'transit_station'];
    const searchPromises: Promise<any[]>[] = [];

    searchBearings.forEach(bearing => {
        const edgePoint = (window as any).google.maps.geometry.spherical.computeOffset(
            zoneCenter, 
            targetZone.radius, 
            bearing
        );

        typesToSearch.forEach(type => {
            const promise = new Promise<any[]>((resolve) => {
                const request = {
                    location: edgePoint,
                    rankBy: (window as any).google.maps.places.RankBy.DISTANCE, 
                    type: type
                };
                service.nearbySearch(request, (results: any[], status: any) => {
                    if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && results) {
                        resolve(results);
                    } else {
                        resolve([]);
                    }
                });
            });
            searchPromises.push(promise);
        });
    });

    try {
        const resultsArray = await Promise.all(searchPromises);
        const allResults = resultsArray.flat();
        const uniquePlaces = Array.from(new Map(allResults.map(item => [item.place_id, item])).values());

        if (uniquePlaces.length === 0) {
             alert("Inga platser hittades vid zonens gräns. Kontrollera API-nyckeln och att Places API är aktiverat.");
             setIsGeneratingBreakpoints(false);
             return;
        }

        const candidates = uniquePlaces
          .map((place: any) => {
            if (!place.geometry || !place.geometry.location) return null;
            const dist = (window as any).google.maps.geometry.spherical.computeDistanceBetween(
              zoneCenter,
              place.geometry.location
            );
            if (dist <= targetZone.radius + 10) return null;
            return {
              ...place,
              distanceToCenter: dist,
              distanceToEdge: dist - targetZone.radius
            };
          })
          .filter((p): p is any => p !== null)
          .sort((a, b) => a.distanceToEdge - b.distanceToEdge); 

        const topCandidates = candidates.slice(0, 6);

        if (topCandidates.length === 0) {
          alert("Kunde inte hitta säkra brytpunkter precis utanför zonen. Prova att flytta zonen något.");
          setIsGeneratingBreakpoints(false);
          return;
        }

        const newMarkers: TacticalMarker[] = topCandidates.map((place: any, index: number) => ({
          id: generateId(),
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          type: 'breakpoint',
          label: place.name || `BP ${index + 1}`
        }));

        setMarkers(prev => [...prev, ...newMarkers]);

        if (mapRef.current) {
          const bounds = new (window as any).google.maps.LatLngBounds();
          newMarkers.forEach(marker => {
              bounds.extend({ lat: marker.lat, lng: marker.lng });
          });
          const north = (window as any).google.maps.geometry.spherical.computeOffset(zoneCenter, targetZone.radius, 0);
          const south = (window as any).google.maps.geometry.spherical.computeOffset(zoneCenter, targetZone.radius, 180);
          const east = (window as any).google.maps.geometry.spherical.computeOffset(zoneCenter, targetZone.radius, 90);
          const west = (window as any).google.maps.geometry.spherical.computeOffset(zoneCenter, targetZone.radius, 270);

          bounds.extend(north);
          bounds.extend(south);
          bounds.extend(east);
          bounds.extend(west);

          mapRef.current.fitBounds(bounds);
        }

    } catch (e) {
        console.error("Error generating breakpoints:", e);
        alert("Ett fel inträffade vid sökning. Se konsolen för detaljer.");
    } finally {
        setIsGeneratingBreakpoints(false);
    }

  }, [zones]);

  // Handler for clearing all zones
  const clearZones = () => {
    if (confirm("Är du säker på att du vill radera alla säkerhetszoner, markörer och vägar?")) {
      setZones([]);
      setMarkers([]);
      setRoadPaths([]);
    }
  };

  // Handler for Place Selection (Search)
  const handlePlaceSelected = useCallback((place: any) => {
    if (place.geometry && place.geometry.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      
      setSearchLocation({
        lat,
        lng,
        address: place.formatted_address || "Okänd plats"
      });

      if (mapRef.current) {
        mapRef.current.panTo({ lat, lng });
        mapRef.current.setZoom(15);
      }
    }
  }, []);

  if (loadError || authError) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-900 text-slate-300 p-6">
        <div className="bg-slate-800 p-8 rounded-lg shadow-2xl max-w-lg border border-red-900/50">
           <div className="flex items-center gap-3 text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="text-xl font-bold font-mono">SYSTEM ERROR</h2>
           </div>
           <p className="text-sm mb-4 font-mono">Google Maps API Error: {authError ? 'Invalid Key (Auth Failure)' : loadError?.message}</p>
           <p className="text-xs text-slate-500 mb-6">
             Detta beror oftast på en ogiltig API-nyckel eller att "Maps JavaScript API" inte är aktiverat i Google Cloud Console för denna nyckel.
           </p>
           <button 
             onClick={onResetKey}
             className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded transition-colors uppercase font-mono text-sm"
           >
             Mata in ny nyckel
           </button>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
       <div className="w-screen h-screen flex items-center justify-center bg-slate-900 text-slate-400">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <span className="font-mono text-xs uppercase tracking-widest">LADDAR TAKTISKA SYSTEM...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-900">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-10" 
           style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      </div>

      {/* Main Map Layer */}
      <div className="absolute inset-0 z-0">
        <SecurityMap 
          zones={zones}
          markers={markers}
          roadPaths={roadPaths} // Pass roads to map
          onMapClick={handleMapClick}
          onMapRightClick={handleMapRightClick}
          isPlacingMode={activeTool !== 'none'} // Derived from activeTool
          mapType={mapType}
          showZones={showZones}
          onZoneDelete={handleDeleteZone}
          onMarkerDelete={handleDeleteMarker}
          onZoneUpdate={handleZoneUpdate}
          searchLocation={searchLocation}
          onLoad={handleMapLoad}
          onCenterChanged={handleCenterChanged}
          // Ghost Zone Props
          previewRadius={radius}
          previewInnerRadius={innerRadius}
          previewType={activeZoneType}
          previewBearing={windDirection}
          previewHasWarmZone={hasWarmZone} // Pass warm zone state
          activeTool={activeTool}
        />
      </div>

      {/* Top HUD (Search, AddressList & Layers) */}
      <TopBar 
        onPlaceSelected={handlePlaceSelected}
        mapType={mapType}
        setMapType={setMapType}
        showZones={showZones}
        setShowZones={setShowZones}
        onCreateZone={handleCreateZoneAtPoint} 
        zones={zones} 
        markers={markers}
        onDeleteZone={handleDeleteZone}
        onDeleteMarker={handleDeleteMarker}
      />

      {/* Left Panel (Creation Controls) */}
      <div className="absolute top-4 left-4 z-30">
         <ControlPanel 
            radius={radius}
            setRadius={setRadius}
            innerRadius={innerRadius}
            setInnerRadius={setInnerRadius}
            isPlacingMode={activeTool === 'zone'} // Backward compat logic prop if needed
            setIsPlacingMode={() => {}} // No-op, managed by activeTool now
            zoneCount={zones.length}
            activeZoneType={activeZoneType}
            setActiveZoneType={setActiveZoneType}
            windDirection={windDirection}
            setWindDirection={setWindDirection}
            currentMapCenter={currentMapCenter}
            onGenerateBreakpoints={handleGenerateBreakpoints}
            isGeneratingBreakpoints={isGeneratingBreakpoints}
            // Manual Breakpoint Props
            markers={markers}
            onAddMarker={handleAddMarker}
            // Road Fetching Props
            onFetchRoads={handleFetchRoads}
            isFetchingRoads={isFetchingRoads}
            // HA Integration
            onOpenHAIntegration={() => setIsHAOpen(true)}
            // Marker Type Selection Props
            activeMarkerType={activeTool === 'zone' ? 'breakpoint' : (activeTool === 'none' ? 'breakpoint' : activeTool)} // Fallback logic
            setActiveMarkerType={() => {}} // No-op
            // NEW UNIFIED TOOL PROP
            activeTool={activeTool}
            setActiveTool={setActiveTool}
          />
      </div>

      {/* HA Integration Modal */}
      <HAIntegrationModal 
        isOpen={isHAOpen}
        onClose={() => setIsHAOpen(false)}
        markers={markers}
        zones={zones}
      />

      {/* Footer / Status */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
        <div className="text-[10px] text-slate-500 font-mono opacity-50">
          SYSTEM: ONLINE<br/>
          MODALITY: {mapType.toUpperCase()}<br/>
          SEC: ENCRYPTED
        </div>
      </div>
      
      <div className="absolute bottom-4 right-4 z-10">
          {(zones.length > 0 || markers.length > 0 || roadPaths.length > 0) && (
            <button 
              onClick={clearZones}
              className="bg-slate-800/80 hover:bg-red-900/80 text-slate-400 hover:text-red-200 border border-slate-700 px-3 py-1 rounded text-xs font-mono transition-colors backdrop-blur-sm shadow-lg"
            >
              RENSA ALLA ZONER
            </button>
          )}
      </div>
    </div>
  );
};

export default function App() {
  // State for Google Maps API Key
  const [apiKey, setApiKey] = useState<string>("");

  if (!apiKey) {
    return (
      <div className="w-screen h-screen bg-slate-900 relative">
         <KeyInputModal onSubmit={setApiKey} />
         {/* Background Grid Pattern */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-10" 
             style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
        </div>
      </div>
    );
  }

  // Only render Dashboard (and invoke the API loader) when we have a key
  return <Dashboard apiKey={apiKey} onResetKey={() => setApiKey("")} />;
}