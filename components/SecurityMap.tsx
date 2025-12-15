import React, { useMemo, useRef, useCallback, useEffect, useState } from 'react';
import { GoogleMap, Circle, Marker, Polygon, Polyline, OverlayView } from '@react-google-maps/api';
import { DEFAULT_CENTER, DARK_MAP_STYLE, GREEN_PIN_ICON, BP_ICON, RED_PIN_ICON, ASSEMBLY_ICON, DECON_ICON, COMMAND_ICON, LEDNINGSPLATS_ICON, SPS_ICON, SEKTOR_ICON, MOB_ICON } from '../constants';
import { Zone, SearchLocation, MapType, MapCenter, TacticalMarker, RoadPath, ToolType } from '../types';

interface SecurityMapProps {
  zones: Zone[];
  markers: TacticalMarker[];
  roadPaths?: RoadPath[];
  onMapClick: (e: any) => void;
  onMapRightClick: (e: any) => void;
  isPlacingMode: boolean; // Kept for ghost logic compatibility, now derived from tool
  mapType: MapType;
  showZones: boolean;
  onZoneDelete: (id: string) => void;
  onMarkerDelete: (id: string) => void;
  onZoneUpdate: (id: string, updates: Partial<Zone>) => void;
  searchLocation: SearchLocation | null;
  onLoad: (map: any) => void;
  onCenterChanged: (center: MapCenter) => void;
  
  // Preview Props for Ghost Zone
  previewRadius: number;
  previewInnerRadius: number;
  previewType: 'circle' | 'sector' | 'keyhole';
  previewBearing: number;
  previewHasWarmZone?: boolean; // New prop to preview warm zone
  activeTool?: ToolType;
  
  // Drift props
  windDirection?: number;
  windSpeed?: number;
}

const containerStyle = {
  width: '100%',
  height: '100%'
};

const TRANSPARENT_PIXEL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const RESIZE_HANDLE_ICON = {
  path: 'M 0,0 m -3,0 a 3,3 0 1,0 6,0 a 3,3 0 1,0 -6,0', 
  fillColor: '#ffffff',
  fillOpacity: 1,
  strokeColor: '#000000',
  strokeWeight: 1,
  scale: 2,
};

const EARTH_RADIUS = 6378137; // meters

function toRad(degrees: number): number {
  return degrees * Math.PI / 180;
}

function toDeg(radians: number): number {
  return radians * 180 / Math.PI;
}

function getDestinationPoint(center: {lat: number, lng: number}, distance: number, bearing: number) {
  const δ = distance / EARTH_RADIUS; // angular distance in radians
  const θ = toRad(bearing);
  const φ1 = toRad(center.lat);
  const λ1 = toRad(center.lng);

  const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
  const λ2 = λ1 + Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φ1), Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2));

  return {
    lat: toDeg(φ2),
    lng: toDeg(λ2)
  };
}

function getSectorPaths(center: {lat: number, lng: number}, radius: number, windBearing: number, spreadAngle: number = 60) {
  const points = [];
  points.push(center);
  const startAngle = windBearing - (spreadAngle / 2);
  const endAngle = windBearing + (spreadAngle / 2);
  const step = 5;
  for (let b = startAngle; b <= endAngle; b += step) {
    points.push(getDestinationPoint(center, radius, b));
  }
  points.push(getDestinationPoint(center, radius, endAngle));
  points.push(center);
  return points;
}

function getLabelPosition(lat: number, lng: number, radius: number, bearing: number = 0) {
  if (typeof window === 'undefined' || !(window as any).google) return { lat, lng };
  return (window as any).google.maps.geometry.spherical.computeOffset(
    new (window as any).google.maps.LatLng(lat, lng),
    radius,
    bearing
  );
}

// Individual Zone Component
const ZoneItem: React.FC<{
  zone: Zone;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Zone>) => void;
  isPlacingMode: boolean;
}> = ({ zone, onDelete, onUpdate, isPlacingMode }) => {
  const circleRef = useRef<any | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [ghostRadius, setGhostRadius] = useState(zone.radius);
  // We keep ghostCenter for resizing calculations, but we won't allow dragging it
  const [ghostCenter] = useState({ lat: zone.lat, lng: zone.lng });
  const resizeTimeoutRef = useRef<any>(null);
  const isInteractive = !isPlacingMode;

  useEffect(() => {
    if (!isResizing && Math.abs(ghostRadius - zone.radius) > 0.1) {
      setGhostRadius(zone.radius);
    }
  }, [zone.radius, isResizing, ghostRadius]);

  const onCircleRadiusChanged = useCallback(() => {
    if (circleRef.current && isInteractive) {
      const newRadius = circleRef.current.getRadius();
      if (Math.abs(newRadius - ghostRadius) < 0.1) return;
      setGhostRadius(newRadius);
      setIsResizing(true);
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = setTimeout(() => {
        setIsResizing(false);
        if (Math.abs(newRadius - zone.radius) > 0.1) {
          onUpdate(zone.id, { radius: newRadius });
        }
      }, 400);
    }
  }, [zone.id, zone.radius, onUpdate, isInteractive, ghostRadius]);

  const onResizeDrag = useCallback((e: any) => {
    if (!isInteractive || !e.latLng) return;
    if (typeof window === 'undefined' || !(window as any).google) return;
    const center = new (window as any).google.maps.LatLng(ghostCenter.lat, ghostCenter.lng);
    const newRadius = (window as any).google.maps.geometry.spherical.computeDistanceBetween(center, e.latLng);
    setIsResizing(true);
    setGhostRadius(newRadius);
  }, [isInteractive, ghostCenter]);

  const onDragEnd = useCallback(() => {
    setIsResizing(false);
    onUpdate(zone.id, { radius: ghostRadius });
  }, [zone.id, ghostRadius, onUpdate]);

  const onCircleLoad = useCallback((circle: any) => {
    circleRef.current = circle;
  }, []);

  const handleBearing = (zone.type === 'sector' || zone.type === 'keyhole') ? (zone.bearing || 0) : 0;
  
  const labelPosition = useMemo(() => {
    return getLabelPosition(ghostCenter.lat, ghostCenter.lng, ghostRadius, handleBearing);
  }, [ghostCenter.lat, ghostCenter.lng, ghostRadius, handleBearing]);

  const sectorPaths = useMemo(() => {
    if ((zone.type === 'sector' || zone.type === 'keyhole') && zone.bearing !== undefined) {
      const spread = zone.type === 'keyhole' ? 45 : 60;
      return getSectorPaths(
        { lat: ghostCenter.lat, lng: ghostCenter.lng }, 
        ghostRadius,
        zone.bearing,
        spread
      );
    }
    return [];
  }, [ghostCenter.lat, ghostCenter.lng, ghostRadius, zone.bearing, zone.type]);

  const interactiveCircleOptions = useMemo(() => ({
    fillColor: '#ef4444', // Hot Zone Red
    strokeColor: '#ef4444',
    strokeWeight: 2,
    clickable: isInteractive,
    fillOpacity: 0.25,
    strokeOpacity: 0.8,
    zIndex: 100,
  }), [isInteractive]);

  const warmZoneCircleOptions = useMemo(() => ({
    fillColor: '#f59e0b', // Warm Zone Orange (Amber-500)
    strokeColor: '#f59e0b',
    strokeWeight: 1,
    fillOpacity: 0.3,
    strokeOpacity: 0.6,
    clickable: false,
    zIndex: 90, // Below hot zone
  }), []);

  // ---------- RENDER KEYHOLE OR SECTOR ----------
  if (zone.type === 'keyhole' || zone.type === 'sector') {
    // For Keyhole/Sector, Decon zone is usually at the source (Inner Radius) + 50m
    // Not at the outer plume edge.
    const warmZoneRadius = (zone.innerRadius || 50) + 50;

    return (
       <React.Fragment>
        {/* Warm Zone: Inner Radius + 50m */}
        {zone.hasWarmZone && (
             <Circle
                center={ghostCenter}
                radius={warmZoneRadius}
                options={warmZoneCircleOptions}
             />
        )}

        {/* The Visible Shape (Polygon) - Hot Zone */}
        <Polygon
          paths={sectorPaths}
          onRightClick={() => isInteractive && onDelete(zone.id)}
          options={{
            fillColor: '#ef4444', // Red for Danger
            fillOpacity: 0.4,
            strokeColor: '#ef4444',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            clickable: isInteractive,
            draggable: false, // Locked
            zIndex: 100
          }}
        />

        {/* Inner Radius Circle (For Keyhole) - Hot Zone */}
        {zone.type === 'keyhole' && (
           <Circle
            center={ghostCenter}
            radius={zone.innerRadius || 50}
            options={{
              fillColor: '#ef4444',
              fillOpacity: 0.4,
              strokeColor: '#ef4444',
              strokeOpacity: 0.8,
              strokeWeight: 2,
              zIndex: 101,
              clickable: isInteractive,
              draggable: false, // Locked
            }}
             onRightClick={() => isInteractive && onDelete(zone.id)}
          />
        )}
        
        {/* CENTER VISUAL (Not draggable) */}
        <Circle 
            center={ghostCenter} 
            radius={4} 
            draggable={false} // Locked
            options={{ 
                fillColor: '#ffffff', 
                fillOpacity: 1, 
                strokeWeight: 2, 
                strokeColor: '#000000', 
                zIndex: 110, 
                clickable: true, 
                draggable: false, 
                cursor: 'default' 
            }} 
            onRightClick={() => isInteractive && onDelete(zone.id)} 
        />
        
        {/* RESIZE HANDLE */}
        {isInteractive && ( 
            <Marker 
                position={labelPosition} 
                icon={RESIZE_HANDLE_ICON} 
                draggable={true} // Allow resize
                onDrag={onResizeDrag} 
                onDragEnd={onDragEnd} 
                zIndex={110} 
                cursor="ew-resize" 
            /> 
        )}
        
        {isResizing && ( <Circle center={ghostCenter} radius={ghostRadius} options={{ strokeColor: '#ef4444', strokeOpacity: 0.6, strokeWeight: 1, fillOpacity: 0, clickable: false, zIndex: 80, icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 2 }, offset: '0', repeat: '10px' }] }} /> )}
      </React.Fragment>
    );
  }

  // ---------- RENDER STANDARD CIRCLE ----------
  return (
    <React.Fragment>
      {/* Warm Zone (Yellow/Orange Buffer) */}
      {zone.hasWarmZone && (
        <Circle
          center={ghostCenter}
          radius={ghostRadius + 50}
          options={warmZoneCircleOptions}
          clickable={false}
        />
      )}

      {/* Hot Zone (Red) */}
      <Circle
        onLoad={onCircleLoad}
        center={ghostCenter}
        radius={ghostRadius} 
        onRightClick={() => isInteractive && onDelete(zone.id)}
        // We disable native editable/draggable to lock position
        editable={false}
        draggable={false}
        options={interactiveCircleOptions}
      />
      
      {/* Center Dot (Locked) */}
      <Circle 
        center={ghostCenter} 
        radius={Math.max(zone.radius * 0.02, 2)} 
        options={{ 
            fillColor: '#ffffff', 
            fillOpacity: 0.9, 
            strokeWeight: 0, 
            zIndex: 101, 
            clickable: true 
        }}
        onRightClick={() => isInteractive && onDelete(zone.id)} 
      />

      {/* CUSTOM RESIZE HANDLE (For Circle) */}
      {isInteractive && (
          <Marker
            position={labelPosition}
            icon={RESIZE_HANDLE_ICON}
            draggable={true}
            onDrag={onResizeDrag}
            onDragEnd={onDragEnd}
            zIndex={110}
            cursor="ew-resize"
          />
      )}

      {/* Resize Feedback Label */}
      {isResizing && (
        <Marker
          position={labelPosition}
          icon={{ url: TRANSPARENT_PIXEL, scaledSize: new (window as any).google.maps.Size(1, 1), anchor: new (window as any).google.maps.Point(0, 0) }}
          label={{
            text: `${Math.round(ghostRadius)}m`,
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 'bold',
            className: 'bg-slate-900/90 text-white px-2 py-1 rounded-lg backdrop-blur-md border border-white/20 shadow-xl mb-4 transform -translate-y-full',
          }}
          zIndex={1000}
        />
      )}
    </React.Fragment>
  );
};

// --- COMPONENT FOR CALCULATING AND RENDERING MOB DRIFT ---
const MOBDriftVisualizer: React.FC<{
  marker: TacticalMarker;
  windDirection: number;
  windSpeed: number;
}> = ({ marker, windDirection, windSpeed }) => {
  const [driftPath, setDriftPath] = useState<Array<{ lat: number, lng: number }>>([]);
  const [currentDriftPos, setCurrentDriftPos] = useState<{ lat: number, lng: number } | null>(null);
  const [searchRadius, setSearchRadius] = useState(0);
  
  // Re-calculate drift every few seconds or when props change
  useEffect(() => {
    if (!marker.createdAt) return;

    const interval = setInterval(() => {
        const now = Date.now();
        const elapsedSeconds = (now - marker.createdAt!) / 1000;
        
        // --- DRIFT PHYSICS (SIMPLIFIED) ---
        // Leeway is typically 3% of wind speed for a person in water.
        // If windSpeed is 0 or undefined, assume a minimal drift (e.g., 0.5 m/s current) or 0.
        // We convert m/s drift to distance.
        
        let driftSpeedMetersPerSecond = 0;
        
        if (windSpeed && windSpeed > 0) {
            driftSpeedMetersPerSecond = windSpeed * 0.03; // 3% rule
        } else {
            driftSpeedMetersPerSecond = 0.2; // minimal drift if no wind known
        }

        const totalDriftDistance = driftSpeedMetersPerSecond * elapsedSeconds;
        
        // Direction: Wind comes FROM, Drift goes TO. So WindDir + 180.
        // If no wind dir, assume 0 or handle gracefullly.
        const driftBearing = (windDirection + 180) % 360;

        const startPoint = { lat: marker.lat, lng: marker.lng };
        const endPoint = getDestinationPoint(startPoint, totalDriftDistance, driftBearing);
        
        setDriftPath([startPoint, endPoint]);
        setCurrentDriftPos(endPoint);

        // Search Radius grows with time (uncertainty)
        // E.g., grows by 0.1m every second + base 10m
        setSearchRadius(10 + (elapsedSeconds * 0.1));

    }, 1000); // Update every second for smooth visual

    return () => clearInterval(interval);
  }, [marker, windDirection, windSpeed]);

  if (!currentDriftPos) return null;

  return (
    <>
       {/* Drift Line (Vector) */}
       <Polyline 
         path={driftPath}
         options={{
            strokeColor: '#ef4444',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            icons: [{ icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 2 }, offset: '0', repeat: '10px' }] // Dashed
         }}
       />
       
       {/* Estimated Position Circle */}
       <Circle 
         center={currentDriftPos}
         radius={searchRadius}
         options={{
            fillColor: '#ef4444',
            fillOpacity: 0.1,
            strokeColor: '#ef4444',
            strokeOpacity: 0.5,
            strokeWeight: 1,
            clickable: false
         }}
       />
       
       {/* X marks the spot */}
        <Marker
            position={currentDriftPos}
            icon={{
                path: (window as any).google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 3,
                strokeColor: '#ef4444',
                fillColor: '#ef4444',
                fillOpacity: 1,
                rotation: (windDirection + 180) % 360
            }}
            zIndex={90}
        />
        
       {/* Info Label Overlay */}
        <OverlayView
              position={currentDriftPos}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
        >
            <div className="absolute left-4 top-0 bg-black/60 backdrop-blur text-white text-[9px] px-2 py-1 rounded whitespace-nowrap border border-red-500/30">
                Drift: {Math.round(searchRadius)}m radie
            </div>
        </OverlayView>
    </>
  );
};


const SecurityMap: React.FC<SecurityMapProps> = ({ 
  zones, markers, roadPaths, onMapClick, onMapRightClick, isPlacingMode, mapType, showZones, onZoneDelete, onMarkerDelete, onZoneUpdate, searchLocation, onLoad, onCenterChanged, 
  previewRadius, previewInnerRadius, previewType, previewBearing, previewHasWarmZone, activeTool,
  windDirection = 0, windSpeed = 0 
}) => {
  const mapRef = useRef<any>(null);
  const ghostCircleRef = useRef<any>(null);
  const ghostWarmRef = useRef<any>(null); // New ghost for warm zone
  const ghostPolyRef = useRef<any>(null);
  const ghostInnerRef = useRef<any>(null);
  const lastMousePosRef = useRef<any>(null);
  const pulseFrameRef = useRef<number>(0);
  
  // State for selected marker (to show delete popup)
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

  const handleMapLoad = useCallback((map: any) => { mapRef.current = map; onLoad(map); }, [onLoad]);

  // Initialize Ghosts
  useEffect(() => {
    if (!mapRef.current || !(window as any).google) return;
    
    const opts = { strokeColor: '#ef4444', strokeOpacity: 0.8, strokeWeight: 1, fillColor: '#ef4444', fillOpacity: 0.2, clickable: false, zIndex: 1000, map: null };
    // Orange/Amber ghost for warm zone
    const warmOpts = { strokeColor: '#f59e0b', strokeOpacity: 0.5, strokeWeight: 1, fillColor: '#f59e0b', fillOpacity: 0.2, clickable: false, zIndex: 990, map: null };

    ghostCircleRef.current = new (window as any).google.maps.Circle(opts);
    ghostWarmRef.current = new (window as any).google.maps.Circle(warmOpts);
    ghostInnerRef.current = new (window as any).google.maps.Circle({...opts, fillColor: '#fbbf24', strokeColor: '#f59e0b'});
    ghostPolyRef.current = new (window as any).google.maps.Polygon({...opts, fillColor: '#fbbf24', strokeColor: '#f59e0b'});
    
    return () => {
        ghostCircleRef.current?.setMap(null);
        ghostWarmRef.current?.setMap(null);
        ghostPolyRef.current?.setMap(null);
        ghostInnerRef.current?.setMap(null);
    };
  }, [mapRef.current]);

  const updateGhosts = useCallback((latLng: any) => {
    if (!latLng) return;
    lastMousePosRef.current = latLng;
    const map = mapRef.current;
    
    // RENDER WARM ZONE PREVIEW
    if (previewHasWarmZone) {
       // Logic: If Circle, Radius + 50. If Keyhole/Sector, InnerRadius (or 50) + 50
       let warmRadius = previewRadius + 50;
       if (previewType === 'keyhole' || previewType === 'sector') {
          warmRadius = (previewInnerRadius || 50) + 50;
       }
       ghostWarmRef.current.setOptions({ center: latLng, radius: warmRadius, map: map });
    } else {
       ghostWarmRef.current.setMap(null);
    }

    if (previewType === 'circle') {
        ghostCircleRef.current.setOptions({ center: latLng, radius: previewRadius, map: map });
        ghostPolyRef.current.setMap(null);
        ghostInnerRef.current.setMap(null);
    } else {
        const spread = previewType === 'keyhole' ? 45 : 60;
        const paths = getSectorPaths({lat: latLng.lat(), lng: latLng.lng()}, previewRadius, previewBearing, spread);
        ghostPolyRef.current.setOptions({ paths: paths, map: map });
        ghostCircleRef.current.setMap(null);
        
        if (previewType === 'keyhole') {
           ghostInnerRef.current.setOptions({ center: latLng, radius: previewInnerRadius, map: map });
        } else {
           ghostInnerRef.current.setMap(null);
        }
    }
  }, [previewRadius, previewInnerRadius, previewType, previewBearing, previewHasWarmZone]);

  // Mouse Listener
  useEffect(() => {
    if (!mapRef.current) return;
    let listener: any;
    // Only show ghost if we are placing a ZONE
    if (isPlacingMode && activeTool === 'zone') {
        listener = mapRef.current.addListener('mousemove', (e: any) => { updateGhosts(e.latLng); });
        if (lastMousePosRef.current) updateGhosts(lastMousePosRef.current);
    } else {
        ghostCircleRef.current?.setMap(null);
        ghostWarmRef.current?.setMap(null);
        ghostPolyRef.current?.setMap(null);
        ghostInnerRef.current?.setMap(null);
        lastMousePosRef.current = null;
    }
    return () => { if (listener) (window as any).google.maps.event.removeListener(listener); };
  }, [isPlacingMode, updateGhosts, activeTool]);

  // Pulse Animation
  useEffect(() => {
    if (!isPlacingMode) { if (pulseFrameRef.current) cancelAnimationFrame(pulseFrameRef.current); return; }
    let start = Date.now();
    const animate = () => {
        const now = Date.now();
        const t = (now - start) / 1000; 
        const baseOpacity = 0.25;
        const variation = 0.1;
        const speed = 4; 
        const opacity = baseOpacity + variation * Math.sin(t * speed);
        
        const shapes = [ghostCircleRef.current, ghostPolyRef.current, ghostInnerRef.current];
        shapes.forEach(s => { if (s && s.getMap()) { s.setOptions({ fillOpacity: opacity }); } });
        
        pulseFrameRef.current = requestAnimationFrame(animate);
    };
    pulseFrameRef.current = requestAnimationFrame(animate);
    return () => { if (pulseFrameRef.current) cancelAnimationFrame(pulseFrameRef.current); };
  }, [isPlacingMode]);

  const handleIdle = useCallback(() => {
    if (mapRef.current) {
      const center = mapRef.current.getCenter();
      if (center) onCenterChanged({ lat: center.lat(), lng: center.lng() });
    }
  }, [onCenterChanged]);
  
  const mapOptions = useMemo(() => ({
    styles: mapType === 'roadmap' ? DARK_MAP_STYLE : undefined,
    disableDefaultUI: true,
    zoomControl: false,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    clickableIcons: false,
    draggableCursor: isPlacingMode ? 'crosshair' : 'grab',
    mapTypeId: mapType,
    gestureHandling: 'greedy',
  }), [isPlacingMode, mapType]);

  const searchMarkerIcon = useMemo(() => {
    if (typeof window !== 'undefined' && (window as any).google) {
        return { ...RED_PIN_ICON, scaledSize: new (window as any).google.maps.Size(30, 40), anchor: new (window as any).google.maps.Point(15, 40) };
    }
    return undefined;
  }, []);

  const greenPinIcon = useMemo(() => {
     if (typeof window !== 'undefined' && (window as any).google) {
      return { ...GREEN_PIN_ICON, scaledSize: new (window as any).google.maps.Size(30, 40), anchor: new (window as any).google.maps.Point(15, 40) };
    }
    return undefined;
  }, []);

  const bpIcon = useMemo(() => {
    if (typeof window !== 'undefined' && (window as any).google) {
      return { ...BP_ICON, scaledSize: new (window as any).google.maps.Size(36, 30), anchor: new (window as any).google.maps.Point(18, 15) };
    }
    return undefined;
  }, []);

  const assemblyIcon = useMemo(() => {
    if (typeof window !== 'undefined' && (window as any).google) {
      return { ...ASSEMBLY_ICON, scaledSize: new (window as any).google.maps.Size(30, 30), anchor: new (window as any).google.maps.Point(15, 15) };
    }
    return undefined;
  }, []);

  const deconIcon = useMemo(() => {
    if (typeof window !== 'undefined' && (window as any).google) {
      return { ...DECON_ICON, scaledSize: new (window as any).google.maps.Size(30, 30), anchor: new (window as any).google.maps.Point(15, 15) };
    }
    return undefined;
  }, []);

  const commandIcon = useMemo(() => {
    if (typeof window !== 'undefined' && (window as any).google) {
      return { ...COMMAND_ICON, scaledSize: new (window as any).google.maps.Size(36, 30), anchor: new (window as any).google.maps.Point(18, 15) };
    }
    return undefined;
  }, []);

  const ledningsplatsIcon = useMemo(() => {
    if (typeof window !== 'undefined' && (window as any).google) {
      return { ...LEDNINGSPLATS_ICON, scaledSize: new (window as any).google.maps.Size(36, 30), anchor: new (window as any).google.maps.Point(18, 15) };
    }
    return undefined;
  }, []);

  const spsIcon = useMemo(() => {
    if (typeof window !== 'undefined' && (window as any).google) {
      return { ...SPS_ICON, scaledSize: new (window as any).google.maps.Size(36, 30), anchor: new (window as any).google.maps.Point(18, 15) };
    }
    return undefined;
  }, []);

  const sektorIcon = useMemo(() => {
    if (typeof window !== 'undefined' && (window as any).google) {
      return { ...SEKTOR_ICON, scaledSize: new (window as any).google.maps.Size(30, 30), anchor: new (window as any).google.maps.Point(15, 15) };
    }
    return undefined;
  }, []);

  const mobIcon = useMemo(() => {
     if (typeof window !== 'undefined' && (window as any).google) {
      return { ...MOB_ICON, scaledSize: new (window as any).google.maps.Size(36, 36), anchor: new (window as any).google.maps.Point(18, 18) };
    }
    return undefined;
  }, []);

  const getMarkerIcon = (type: string) => {
    switch (type) {
        case 'assembly': return assemblyIcon;
        case 'decon': return deconIcon;
        case 'command': return commandIcon;
        case 'breakpoint': return bpIcon;
        case 'ledningsplats': return ledningsplatsIcon;
        case 'sps': return spsIcon;
        case 'sektor': return sektorIcon;
        case 'mob': return mobIcon;
        default: return greenPinIcon;
    }
  };

  const getMarkerColor = (type: string) => {
      switch (type) {
          case 'breakpoint': return 'text-red-500'; // BP/Red
          case 'assembly': return 'text-red-500'; // Medical/Red
          case 'decon': return 'text-purple-500'; // Decon/Purple
          case 'command': return 'text-emerald-500'; // Command/Green
          case 'ledningsplats': return 'text-red-600'; // Command Post/Red
          case 'sps': return 'text-yellow-500'; // SPS/Yellow
          case 'sektor': return 'text-slate-400'; // Sector/Grey
          case 'mob': return 'text-red-600'; // MOB/Red
          default: return 'text-white';
      }
  };

  // Wrapper for parent map click to clear selection first
  const handleMapBackgroundClick = (e: any) => {
    if (selectedMarkerId) {
      setSelectedMarkerId(null);
    } else {
      onMapClick(e);
    }
  };

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={DEFAULT_CENTER}
      zoom={13}
      onLoad={handleMapLoad}
      options={mapOptions}
      onClick={handleMapBackgroundClick}
      onRightClick={onMapRightClick}
      onIdle={handleIdle}
    >
      {roadPaths && roadPaths.map((path, idx) => (
        <Polyline
            key={`road-${idx}`}
            path={path}
            options={{ strokeColor: '#60a5fa', strokeWeight: 4, strokeOpacity: 0.6, clickable: false, geodesic: true, zIndex: 50 }}
        />
      ))}

      {searchLocation && (
        <Marker 
          position={{ lat: searchLocation.lat, lng: searchLocation.lng }}
          animation={(window as any).google.maps.Animation.DROP}
          icon={searchMarkerIcon}
          title={searchLocation.address}
        />
      )}

      {showZones && zones.map((zone) => (
        <ZoneItem 
          key={zone.id} 
          zone={zone} 
          onDelete={onZoneDelete} 
          onUpdate={onZoneUpdate} 
          isPlacingMode={isPlacingMode}
        />
      ))}
      
      {/* RENDER TACTICAL MARKERS WITH PULSE (using OverlayView) */}
      {markers.map((marker) => {
          // If this is a MOB marker, render its drift visualization
          if (marker.type === 'mob') {
              return (
                  <React.Fragment key={marker.id}>
                    <MOBDriftVisualizer 
                        marker={marker} 
                        windDirection={windDirection}
                        windSpeed={windSpeed}
                    />
                    
                    {/* Render standard marker overlay too (below) */}
                    <OverlayView
                        position={{ lat: marker.lat, lng: marker.lng }}
                        mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    >
                        <div 
                            className="relative flex items-center justify-center cursor-pointer group w-10 h-10"
                            style={{ transform: 'translate(-50%, -50%)', zIndex: selectedMarkerId === marker.id ? 5000 : 100 }}
                            onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onMarkerDelete(marker.id); }}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedMarkerId(selectedMarkerId === marker.id ? null : marker.id); }}
                        >
                            {selectedMarkerId === marker.id && (
                                <div 
                                    className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-32 bg-slate-900/95 backdrop-blur-md border border-white/20 rounded-lg p-2 shadow-2xl flex flex-col items-center gap-2 animate-fade-in origin-bottom cursor-default"
                                    onClick={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onTouchStart={(e) => e.stopPropagation()}
                                    onPointerDown={(e) => e.stopPropagation()}
                                >
                                <span className="text-[10px] font-bold text-white truncate max-w-full leading-tight">{marker.label || "MOB"}</span>
                                <button 
                                    type="button" 
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedMarkerId(null); onMarkerDelete(marker.id); }} 
                                    onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedMarkerId(null); onMarkerDelete(marker.id); }}
                                    className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold px-4 py-2 rounded w-full uppercase shadow-lg pointer-events-auto"
                                >
                                    AVSLUTA
                                </button>
                                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-r border-b border-white/20 rotate-45"></div>
                                </div>
                            )}
                            <div className="absolute inset-0 rounded-full text-red-600 animate-tactical-pulse opacity-80"></div>
                            {selectedMarkerId === marker.id && <div className="absolute -inset-2 border-2 border-white/50 rounded-full animate-ping opacity-30"></div>}
                            <img src={mobIcon?.url} alt="MOB" className={`relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] transform transition-transform duration-200 ${selectedMarkerId === marker.id ? 'scale-110' : 'hover:scale-110'} w-8 h-8`} />
                        </div>
                    </OverlayView>
                  </React.Fragment>
              );
          }

          // STANDARD MARKER LOGIC
          const iconObj = getMarkerIcon(marker.type);
          const iconUrl = iconObj?.url || '';
          const pulseColor = getMarkerColor(marker.type);
          const isSelected = selectedMarkerId === marker.id;

          const isBP = marker.type === 'breakpoint';
          const isSPS = marker.type === 'sps';
          const isCommand = marker.type === 'command';
          const isLedning = marker.type === 'ledningsplats';
          
          const containerClass = (isBP || isSPS || isCommand || isLedning) ? "w-12 h-10" : "w-10 h-10";
          const imgClass = (isBP || isSPS || isCommand || isLedning) ? "w-full h-full object-contain" : "w-8 h-8";
          const zIndex = isSelected ? 5000 : 100;

          return (
            <OverlayView
              key={marker.id}
              position={{ lat: marker.lat, lng: marker.lng }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div 
                  className={`relative flex items-center justify-center cursor-pointer group ${containerClass}`}
                  style={{ transform: 'translate(-50%, -100%)', zIndex: zIndex }}
                  onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onMarkerDelete(marker.id); }}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedMarkerId(isSelected ? null : marker.id); }}
                  title={marker.label}
              >
                  {isSelected && (
                    <div 
                        className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-32 bg-slate-900/95 backdrop-blur-md border border-white/20 rounded-lg p-2 shadow-2xl flex flex-col items-center gap-2 animate-fade-in origin-bottom cursor-default"
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                    >
                      <span className="text-[10px] font-bold text-white truncate max-w-full leading-tight">{marker.label || "Plats"}</span>
                      <button 
                        type="button" 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedMarkerId(null); onMarkerDelete(marker.id); }}
                        onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedMarkerId(null); onMarkerDelete(marker.id); }}
                        className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold px-4 py-2 rounded w-full uppercase shadow-lg pointer-events-auto"
                      >
                        TA BORT
                      </button>
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-r border-b border-white/20 rotate-45"></div>
                    </div>
                  )}
                  <div className={`absolute inset-0 ${(isBP || isSPS || isCommand || isLedning) ? 'rounded-xl' : 'rounded-full'} ${pulseColor} animate-tactical-pulse opacity-80`}></div>
                  {isSelected && <div className={`absolute -inset-2 border-2 border-white/50 rounded-full animate-ping opacity-30`}></div>}
                  <img src={iconUrl} alt={marker.type} className={`relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] transform transition-transform duration-200 ${isSelected ? 'scale-110' : 'hover:scale-110'} ${imgClass}`} />
              </div>
            </OverlayView>
          );
      })}
    </GoogleMap>
  );
};

export default React.memo(SecurityMap);