

// Stockholm default center
export const DEFAULT_CENTER = {
  lat: 59.3293,
  lng: 18.0686,
};

// Custom Green Pin Icon (SVG Data URI)
export const GREEN_PIN_ICON = {
  url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="30" height="40">
      <path fill="#34d399" d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z"/>
      <circle cx="192" cy="192" r="90" fill="white"/>
    </svg>
  `)}`,
  scaledSize: { width: 30, height: 40 },
  anchor: { x: 15, y: 40 }, // Center bottom
  labelOrigin: { x: 15, y: -10 }
};

// Custom Red Pin Icon for Search Results
export const RED_PIN_ICON = {
  url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="30" height="40">
      <path fill="#ef4444" d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z"/>
      <circle cx="192" cy="192" r="90" fill="white"/>
    </svg>
  `)}`,
  scaledSize: { width: 30, height: 40 },
  anchor: { x: 15, y: 40 }, // Center bottom
  labelOrigin: { x: 15, y: -10 }
};

// Ambulance Icon for breakpoints (Brytpunkt) - Updated to Yellow/Green Battenburg Style
export const AMBULANCE_ICON = {
  url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 120" width="60" height="30">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.5"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <!-- Wheels -->
        <circle cx="50" cy="100" r="16" fill="#1a1a1a" stroke="#333" stroke-width="2"/>
        <circle cx="50" cy="100" r="6" fill="#ccc"/>
        <circle cx="190" cy="100" r="16" fill="#1a1a1a" stroke="#333" stroke-width="2"/>
        <circle cx="190" cy="100" r="6" fill="#ccc"/>
        
        <!-- Body Shape -->
        <path d="M10,100 L10,50 L60,10 L230,10 L230,100 Z" fill="#FFEB3B" stroke="#D4AF37" stroke-width="1"/>
        
        <!-- Cabin Windows -->
        <path d="M65,15 L110,15 L110,50 L62,50 Z" fill="#2c3e50"/>
        <path d="M120,15 L160,15 L160,50 L120,50 Z" fill="#BDC3C7" stroke="#999" stroke-width="1"/> <!-- Side shutter -->
        
        <!-- Front Window/Windshield -->
        <path d="M12,50 L58,12 L60,50 Z" fill="#aed6f1" opacity="0.6"/>

        <!-- Battenburg Markings (Green/Yellow) -->
        <g transform="translate(0, 65)">
             <rect x="10" y="0" width="220" height="20" fill="#FFEB3B"/>
             <!-- Top Row -->
             <rect x="10" y="0" width="20" height="10" fill="#009000"/>
             <rect x="50" y="0" width="20" height="10" fill="#009000"/>
             <rect x="90" y="0" width="20" height="10" fill="#009000"/>
             <rect x="130" y="0" width="20" height="10" fill="#009000"/>
             <rect x="170" y="0" width="20" height="10" fill="#009000"/>
             <rect x="210" y="0" width="20" height="10" fill="#009000"/>
             
             <!-- Bottom Row (Offset) -->
             <rect x="30" y="10" width="20" height="10" fill="#009000"/>
             <rect x="70" y="10" width="20" height="10" fill="#009000"/>
             <rect x="110" y="10" width="20" height="10" fill="#009000"/>
             <rect x="150" y="10" width="20" height="10" fill="#009000"/>
             <rect x="190" y="10" width="20" height="10" fill="#009000"/>
        </g>

        <!-- Star of Life -->
        <text x="195" y="45" font-family="Arial" font-size="24" fill="#0055FF" text-anchor="middle" font-weight="bold">*</text>
        
        <!-- Text -->
        <text x="140" y="60" font-family="Arial" font-size="12" fill="#009000" font-weight="bold" text-anchor="middle">AMBULANCE</text>
        <text x="35" y="85" font-family="Arial" font-size="10" fill="#009000" font-weight="bold">112</text>
        <text x="35" y="75" font-family="Arial" font-size="8" fill="#009000" font-weight="bold">ALARM</text>

        <!-- Blue Lights -->
        <rect x="70" y="2" width="20" height="8" fill="#0055ff" rx="2">
           <animate attributeName="opacity" values="1;0.5;1" dur="0.5s" repeatCount="indefinite" />
        </rect>
        <rect x="180" y="2" width="20" height="8" fill="#0055ff" rx="2">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="0.5s" repeatCount="indefinite" />
        </rect>
      </g>
    </svg>
  `)}`,
  scaledSize: { width: 60, height: 30 },
  anchor: { x: 30, y: 15 },
  labelOrigin: { x: 30, y: -10 }
};

// Assembly Point Icon (Uppsamlingsplats) - Changed to RED MEDICAL CROSS
export const ASSEMBLY_ICON = {
  url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="30" height="30">
      <circle cx="224" cy="256" r="224" fill="#ffffff" />
      <path fill="#ef4444" d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/>
    </svg>
  `)}`,
  scaledSize: { width: 30, height: 30 },
  anchor: { x: 15, y: 15 },
  labelOrigin: { x: 15, y: -10 }
};

// Decon Icon (Saneringsplats) - Changed to Shower Icon
export const DECON_ICON = {
  url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="30" height="30">
       <circle cx="256" cy="256" r="240" fill="#e0f2fe" />
       <path fill="#0284c7" d="M256 0c-44.2 0-80 35.8-80 80v32h-43c-35.3 0-64 28.7-64 64v24c0 13.3 10.7 24 24 24h326c13.3 0 24-10.7 24-24v-24c0-35.3-28.7-64-64-64h-43V80c0-44.2-35.8-80-80-80zM128 288c0-17.7-14.3-32-32-32s-32 14.3-32 32v160c0 17.7 14.3 32 32 32s32-14.3 32-32V288zm128 0c0-17.7-14.3-32-32-32s-32 14.3-32 32v160c0 17.7 14.3 32 32 32s32-14.3 32-32V288zm128 0c0-17.7-14.3-32-32-32s-32 14.3-32 32v160c0 17.7 14.3 32 32 32s32-14.3 32-32V288z"/>
    </svg>
  `)}`,
  scaledSize: { width: 30, height: 30 },
  anchor: { x: 15, y: 15 },
  labelOrigin: { x: 15, y: -10 }
};

// Command Icon (FRS/Ledningsplats) - Changed to Green Box with Red Cross
export const COMMAND_ICON = {
  url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="30" height="30">
       <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="1" stdDeviation="1" flood-color="#000" flood-opacity="0.3"/>
        </filter>
      </defs>
      <!-- Green Box -->
      <rect x="5" y="10" width="90" height="80" rx="10" fill="#10b981" stroke="#047857" stroke-width="4" filter="url(#shadow)" />
      <!-- Red Cross -->
      <path fill="#ef4444" d="M42 30h16v14h14v16H58v14H42V60H28V44h14V30z" stroke="#991b1b" stroke-width="1" />
    </svg>
  `)}`,
  scaledSize: { width: 30, height: 30 },
  anchor: { x: 15, y: 15 },
  labelOrigin: { x: 15, y: -10 }
};

export const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

export const SAFETY_SCENARIOS = [
  {
    category: "Riskavstånd Bomb (Stad)",
    items: [
      { label: "Utomhus stad: Portfölj, paket, handgranat, bomb i bil", radius: 100, type: 'circle' },
      { label: "Utomhus stad: Bilbomb (personbil) / Självmordsväst", radius: 200, type: 'circle' },
      { label: "Utomhus stad: Bilbomb (skåpbil)", radius: 400, type: 'circle' },
    ]
  },
  {
    category: "Riskavstånd Bomb (Öppen Terräng)",
    items: [
      { label: "Öppen terräng: Portfölj, paket, handgranat, bomb i bil", radius: 200, type: 'circle' },
      { label: "Öppen terräng: Bilbomb (personbil) / Självmordsväst", radius: 400, type: 'circle' },
      { label: "Öppen terräng: Bilbomb (skåpbil)", radius: 800, type: 'circle' },
    ]
  },
  {
    category: "Okänt ämne (Andra situationer)",
    items: [
      { label: "Fast ämne (okänt)", radius: 50, type: 'circle', description: "Initialt riskavstånd" },
      { label: "Vätska (okänt)", radius: 100, type: 'circle', description: "Från pölens kant" },
      { label: "Gas (okänt)", radius: 300, type: 'circle', description: "Initialt riskavstånd" },
    ]
  },
  {
    category: "Klass 1 - Explosiva ämnen",
    items: [
      { label: "Brand i personbil", radius: 300, type: 'circle' },
      { label: "Brand i lastbil, byggnad, förråd", radius: 800, type: 'circle' },
      { label: "Brand i försäljningslokal", radius: 50, type: 'circle' },
      { label: "Brand i fullastad container / fyllt förråd", radius: 500, type: 'circle' },
      { label: "Vid brand (allmän)", radius: 50, type: 'circle' },
    ]
  },
  {
    category: "Klass 2 - Brandfarliga gaser",
    items: [
      { label: "Litet utsläpp (packningsläckage)", radius: 100, type: 'circle' },
      { label: "Större utsläpp (brott på anslutningsrör)", radius: 300, type: 'circle' },
      { label: "Tank/Cistern risk för rämning (BLEVE)", radius: 1000, type: 'circle' },
      { label: "Aerosol- och engångsbehållare", radius: 25, type: 'circle' },
      { label: "Brandutsatt gasflaska (≤ 45 kg)", radius: 300, type: 'circle' },
      { label: "Brandutsatt gasflaska (> 45 kg)", radius: 500, type: 'circle' },
    ]
  },
  {
    category: "Klass 2 - Giftiga gaser",
    items: [
      { label: "Litet utsläpp (Vind > 5m/s)", radius: 300, innerRadius: 50, type: 'keyhole', description: "300m i vindriktning, 50m mot vind" },
      { label: "Litet utsläpp (Vind < 5m/s)", radius: 1000, type: 'circle', description: "1km radie vid svag vind" },
      { label: "Större utsläpp (Vind > 5m/s)", radius: 1000, innerRadius: 50, type: 'keyhole', description: "1km i vindriktning, 50m mot vind" },
      { label: "Större utsläpp (Vind < 2m/s)", radius: 2000, type: 'circle', description: "Riskavstånd 2km till 10km radie" },
      { label: "Aerosol- och engångsbehållare", radius: 25, type: 'circle' },
      { label: "Brandutsatt gasflaska", radius: 300, type: 'circle' },
    ]
  },
  {
    category: "Klass 2 - Ej brandfarliga/giftiga",
    items: [
      { label: "Aerosol- och engångsbehållare", radius: 25, type: 'circle' },
      { label: "Läckande gasflaska", radius: 25, type: 'circle' },
      { label: "Brandutsatt gasflaska", radius: 300, type: 'circle' },
      { label: "Tank/Cistern risk för rämning", radius: 1000, type: 'circle' },
    ]
  },
  {
    category: "Klass 3 - Brandfarliga vätskor",
    items: [
      { label: "Läckage personbil (max 100L)", radius: 50, type: 'circle' },
      { label: "Tankbil (Höst-Vinter-Vår)", radius: 50, type: 'circle' },
      { label: "Tankbil (Sommar)", radius: 100, type: 'circle' },
      { label: "Oljedepå (Höst-Vinter-Vår)", radius: 100, type: 'circle' },
      { label: "Oljedepå (Sommar)", radius: 300, type: 'circle' },
    ]
  },
  {
    category: "Klass 4 - Brandfarliga fasta ämnen",
    items: [
        { label: "Klass 4.1 Fasta (Initialt)", radius: 50, type: 'circle' },
        { label: "Klass 4.1 Vid brand/avgasning", radius: 300, type: 'circle' },
        { label: "Klass 4.2 Självantändande (Initialt)", radius: 50, type: 'circle' },
        { label: "Klass 4.2 Vid brand/avgasning", radius: 300, type: 'circle' },
        { label: "Klass 4.3 Utv. gas m. vatten (Initialt)", radius: 50, type: 'circle' },
        { label: "Klass 4.3 Vid brand/avgasning", radius: 300, type: 'circle' },
    ]
  },
  {
    category: "Klass 5 - Oxiderande/Peroxider",
    items: [
        { label: "Klass 5.1 Oxiderande (Initialt)", radius: 50, type: 'circle' },
        { label: "Klass 5.1 Risk för brand/explosion", radius: 300, type: 'circle' },
        { label: "Klass 5.2 Org. Peroxider (Initialt)", radius: 50, type: 'circle' },
        { label: "Klass 5.2 Risk för brand/explosion", radius: 300, type: 'circle' },
    ]
  },
  {
    category: "Klass 6 - Giftiga & Smittförande",
    items: [
        { label: "Klass 6.1 Giftiga fasta ämnen", radius: 50, type: 'circle' },
        { label: "Klass 6.1 Giftiga vätskor", radius: 100, type: 'circle' },
        { label: "Klass 6.1 Vid brand/avgasning", radius: 300, type: 'circle' },
        { label: "Klass 6.2 Smittförande/Toxiner", radius: 50, type: 'circle' },
    ]
  },
  {
    category: "Klass 7, 8, 9",
    items: [
        { label: "Klass 7 Radioaktivt (Initialt)", radius: 50, type: 'circle' },
        { label: "Klass 7 Vätska eller ångor", radius: 300, type: 'circle' },
        { label: "Klass 8 Frätande (Initialt)", radius: 50, type: 'circle' },
        { label: "Klass 8 Avgasning/Reaktion", radius: 100, type: 'circle' },
        { label: "Klass 9 Övriga (Initialt)", radius: 50, type: 'circle' },
        { label: "Klass 9 Vid brand", radius: 100, type: 'circle' },
    ]
  }
];

// Comprehensive List of Common Dangerous Goods
export const DANGEROUS_GOODS = [
  // --- GENERICS & CLASSES ---
  { un: "KLASS 1", label: "Klass 1: Brand i personbil", radius: 300, info: "Explosiv vara", type: 'circle' },
  { un: "KLASS 1", label: "Klass 1: Brand i lastbil/byggnad", radius: 800, info: "Explosiv vara", type: 'circle' },
  { un: "KLASS 2", label: "Klass 2: Gasol/Brandfarlig gas (Utsläpp)", radius: 300, info: "Gasol/Brandfarlig gas", type: 'circle' },
  { un: "KLASS 2", label: "Klass 2: Giftig gas (stort utsläpp)", radius: 1000, info: "Giftig gas", type: 'keyhole', innerRadius: 100 },
  { un: "KLASS 2", label: "Klass 2: BLEVE-risk", radius: 1000, info: "Risk för tryckkärlsexplosion", type: 'circle' },
  { un: "KLASS 3", label: "Klass 3: Brandfarlig vätska (Liten)", radius: 50, info: "Brandfarlig vätska", type: 'circle' },
  { un: "KLASS 3", label: "Klass 3: Brandfarlig vätska (Stor/Tankbil)", radius: 100, info: "Brandfarlig vätska", type: 'circle' },
  { un: "KLASS 6", label: "Klass 6: Giftiga ämnen (Initialt)", radius: 50, info: "Giftiga ämnen", type: 'circle' },
  { un: "KLASS 8", label: "Klass 8: Frätande ämnen (Initialt)", radius: 50, info: "Frätande ämnen", type: 'circle' },
  { un: "KLASS 7", label: "Klass 7: Radioaktivt", radius: 50, info: "Radioaktiva ämnen", type: 'circle' },

  // --- SPECIFIC UN NUMBERS (Common / Critical) ---
  
  // GASES (Class 2)
  { un: "1001", label: "UN 1001 Acetylen, löst", radius: 300, info: "Brandfarlig gas (Gasflaskor)", type: 'circle' },
  { un: "1005", label: "UN 1005 Ammoniak, vattenfri", radius: 1000, info: "Giftig/Frätande gas", type: 'keyhole', innerRadius: 100 },
  { un: "1006", label: "UN 1006 Argon, komprimerad", radius: 100, info: "Kvävande gas (Läckage)", type: 'circle' },
  { un: "1011", label: "UN 1011 Butan", radius: 300, info: "Brandfarlig gas", type: 'circle' },
  { un: "1013", label: "UN 1013 Koldioxid", radius: 100, info: "Kvävande gas", type: 'circle' },
  { un: "1017", label: "UN 1017 Klor", radius: 1000, info: "Giftig gas (Mycket farlig)", type: 'keyhole', innerRadius: 100 },
  { un: "1038", label: "UN 1038 Eten, kyld vätska", radius: 300, info: "Brandfarlig gas", type: 'circle' },
  { un: "1040", label: "UN 1040 Etenoxid", radius: 1000, info: "Giftig/Brandfarlig gas (Explosionsrisk)", type: 'keyhole', innerRadius: 100 },
  { un: "1049", label: "UN 1049 Väte (Vätgas)", radius: 300, info: "Brandfarlig gas", type: 'circle' },
  { un: "1050", label: "UN 1050 Väteklorid (Saltsyra gas)", radius: 1000, info: "Giftig/Frätande gas", type: 'keyhole', innerRadius: 100 },
  { un: "1052", label: "UN 1052 Vätesteklorid", radius: 1000, info: "Giftig/Frätande gas", type: 'keyhole', innerRadius: 100 },
  { un: "1066", label: "UN 1066 Kväve", radius: 100, info: "Kvävande gas", type: 'circle' },
  { un: "1072", label: "UN 1072 Syre (Syrgas)", radius: 100, info: "Oxiderande gas (Brandfara)", type: 'circle' },
  { un: "1073", label: "UN 1073 Syre, kyld vätska", radius: 100, info: "Oxiderande gas (Brandfara)", type: 'circle' },
  { un: "1075", label: "UN 1075 Petroleumgaser (Gasol/LPG)", radius: 300, info: "Brandfarlig gas", type: 'circle' },
  { un: "1077", label: "UN 1077 Propen", radius: 300, info: "Brandfarlig gas", type: 'circle' },
  { un: "1079", label: "UN 1079 Svaveldioxid", radius: 1000, info: "Giftig gas", type: 'keyhole', innerRadius: 100 },
  { un: "1951", label: "UN 1951 Argon, kyld vätska", radius: 100, info: "Kvävande gas", type: 'circle' },
  { un: "1965", label: "UN 1965 Kolvätegasblandning (Gasol)", radius: 300, info: "Brandfarlig gas", type: 'circle' },
  { un: "1969", label: "UN 1969 Isobutan", radius: 300, info: "Brandfarlig gas", type: 'circle' },
  { un: "1971", label: "UN 1971 Naturgas (Metan)", radius: 300, info: "Brandfarlig gas", type: 'circle' },
  { un: "1972", label: "UN 1972 Naturgas, kyld vätska (LNG)", radius: 300, info: "Brandfarlig gas (Kryo)", type: 'circle' },
  { un: "1977", label: "UN 1977 Kväve, kyld vätska", radius: 100, info: "Kvävande gas", type: 'circle' },
  { un: "1978", label: "UN 1978 Propan", radius: 300, info: "Brandfarlig gas", type: 'circle' },
  { un: "2187", label: "UN 2187 Koldioxid, kyld vätska", radius: 100, info: "Kvävande gas", type: 'circle' },
  { un: "2201", label: "UN 2201 Kväveoxidul (Lustgas)", radius: 100, info: "Oxiderande gas", type: 'circle' },

  // FLAMMABLE LIQUIDS (Class 3)
  { un: "1090", label: "UN 1090 Aceton", radius: 100, info: "Mycket brandfarlig vätska", type: 'circle' },
  { un: "1114", label: "UN 1114 Bensen", radius: 100, info: "Brandfarlig/Giftig vätska", type: 'circle' },
  { un: "1170", label: "UN 1170 Etanol (Sprit)", radius: 100, info: "Brandfarlig vätska", type: 'circle' },
  { un: "1202", label: "UN 1202 Diesel/Eldningsolja", radius: 100, info: "Brandfarlig vätska", type: 'circle' },
  { un: "1203", label: "UN 1203 Bensin (Motorbränsle)", radius: 100, info: "Mycket brandfarlig vätska", type: 'circle' },
  { un: "1219", label: "UN 1219 Isopropanol", radius: 100, info: "Brandfarlig vätska", type: 'circle' },
  { un: "1223", label: "UN 1223 Fotogen", radius: 100, info: "Brandfarlig vätska", type: 'circle' },
  { un: "1230", label: "UN 1230 Metanol", radius: 100, info: "Brandfarlig/Giftig vätska", type: 'circle' },
  { un: "1263", label: "UN 1263 Färg/Färgrelaterat material", radius: 100, info: "Brandfarlig vätska", type: 'circle' },
  { un: "1267", label: "UN 1267 Råolja", radius: 300, info: "Brandfarlig vätska (Ofta stora mängder)", type: 'circle' },
  { un: "1268", label: "UN 1268 Petroleumdestillat", radius: 100, info: "Brandfarlig vätska", type: 'circle' },
  { un: "1300", label: "UN 1300 Terpentinersättning", radius: 100, info: "Brandfarlig vätska", type: 'circle' },
  { un: "1863", label: "UN 1863 Flygbränsle (Jet A1)", radius: 100, info: "Brandfarlig vätska", type: 'circle' },
  { un: "1993", label: "UN 1993 Brandfarlig vätska, N.O.S", radius: 100, info: "Brandfarlig vätska", type: 'circle' },
  { un: "3065", label: "UN 3065 Alkoholhaltiga drycker", radius: 50, info: "Brandfarlig vätska", type: 'circle' },
  { un: "3295", label: "UN 3295 Kolväten, flytande", radius: 100, info: "Brandfarlig vätska", type: 'circle' },
  { un: "3475", label: "UN 3475 Etanol och bensinblandning (E85)", radius: 100, info: "Mycket brandfarlig vätska", type: 'circle' },

  // SOLIDS (Class 4)
  { un: "1325", label: "UN 1325 Brandfarligt fast ämne", radius: 50, info: "Brandfarligt fast", type: 'circle' },
  { un: "1334", label: "UN 1334 Naftalen", radius: 50, info: "Brandfarligt fast", type: 'circle' },
  { un: "1350", label: "UN 1350 Svavel", radius: 50, info: "Brandfarligt fast", type: 'circle' },
  { un: "1402", label: "UN 1402 Kalciumkarbid", radius: 50, info: "Utv. brandfarlig gas vid kontakt med vatten", type: 'circle' },
  { un: "1428", label: "UN 1428 Natrium", radius: 50, info: "Utv. gas vid vattenkontakt", type: 'circle' },
  { un: "2015", label: "UN 2015 Väteperoxid (>60%)", radius: 300, info: "Oxiderande/Explosionsrisk", type: 'circle' },

  // OXIDIZERS (Class 5)
  { un: "1495", label: "UN 1495 Natriumklorat", radius: 50, info: "Oxiderande", type: 'circle' },
  { un: "1942", label: "UN 1942 Ammoniumnitrat", radius: 300, info: "Oxiderande (Explosionsrisk vid brand)", type: 'circle' },
  { un: "2014", label: "UN 2014 Väteperoxid (20-60%)", radius: 100, info: "Oxiderande/Frätande", type: 'circle' },

  // TOXIC SUBSTANCES (Class 6)
  { un: "1547", label: "UN 1547 Anilin", radius: 100, info: "Giftig vätska", type: 'circle' },
  { un: "1593", label: "UN 1593 Diklor", radius: 100, info: "Giftig vätska", type: 'circle' },
  { un: "1661", label: "UN 1661 Nitroaniliner", radius: 50, info: "Giftigt fast", type: 'circle' },
  { un: "1662", label: "UN 1662 Nitrobenzen", radius: 100, info: "Giftig vätska", type: 'circle' },
  { un: "2024", label: "UN 2024 Kvicksilverförening, flytande", radius: 100, info: "Giftig vätska", type: 'circle' },
  { un: "2025", label: "UN 2025 Kvicksilverförening, fast", radius: 50, info: "Giftigt fast", type: 'circle' },
  { un: "2078", label: "UN 2078 Toluendiisocyanat", radius: 100, info: "Giftig vätska", type: 'circle' },
  { un: "2291", label: "UN 2291 Blyförening, löslig", radius: 50, info: "Giftigt fast", type: 'circle' },
  { un: "2312", label: "UN 2312 Fenol, smält", radius: 100, info: "Giftig/Frätande", type: 'circle' },
  { un: "2810", label: "UN 2810 Giftig vätska, N.O.S", radius: 100, info: "Giftig vätska", type: 'circle' },
  { un: "2811", label: "UN 2811 Giftigt fast ämne, N.O.S", radius: 50, info: "Giftigt fast", type: 'circle' },

  // CORROSIVES (Class 8)
  { un: "1719", label: "UN 1719 Frätande alkalisk vätska (Lut)", radius: 100, info: "Frätande vätska", type: 'circle' },
  { un: "1760", label: "UN 1760 Frätande vätska, N.O.S", radius: 100, info: "Frätande vätska", type: 'circle' },
  { un: "1789", label: "UN 1789 Saltsyra", radius: 100, info: "Frätande (Avgasande)", type: 'circle' },
  { un: "1791", label: "UN 1791 Hypokloritlösning (Klorin)", radius: 100, info: "Frätande", type: 'circle' },
  { un: "1805", label: "UN 1805 Fosforsyra", radius: 100, info: "Frätande", type: 'circle' },
  { un: "1814", label: "UN 1814 Kaliumhydroxidlösning", radius: 100, info: "Frätande", type: 'circle' },
  { un: "1823", label: "UN 1823 Natriumhydroxid, fast (Kaustiksoda)", radius: 50, info: "Frätande fast", type: 'circle' },
  { un: "1824", label: "UN 1824 Natriumhydroxidlösning (Lut)", radius: 100, info: "Frätande vätska", type: 'circle' },
  { un: "1830", label: "UN 1830 Svavelsyra (>51%)", radius: 100, info: "Starkt frätande", type: 'circle' },
  { un: "2031", label: "UN 2031 Salpetersyra", radius: 100, info: "Frätande/Oxiderande", type: 'circle' },
  { un: "2218", label: "UN 2218 Akrylsyra, stabiliserad", radius: 100, info: "Frätande/Brandfarlig", type: 'circle' },
  { un: "2672", label: "UN 2672 Ammoniaklösning", radius: 100, info: "Frätande/Giftig", type: 'circle' },
  { un: "2794", label: "UN 2794 Batterier, våta, med syra", radius: 50, info: "Frätande", type: 'circle' },
  { un: "2796", label: "UN 2796 Svavelsyra (<51%)", radius: 100, info: "Frätande", type: 'circle' },
  { un: "3264", label: "UN 3264 Frätande sur vätska, oorganisk", radius: 100, info: "Frätande", type: 'circle' },
  { un: "3265", label: "UN 3265 Frätande sur vätska, organisk", radius: 100, info: "Frätande", type: 'circle' },
  { un: "3266", label: "UN 3266 Frätande basisk vätska, oorganisk", radius: 100, info: "Frätande", type: 'circle' },

  // MISCELLANEOUS (Class 9)
  { un: "3077", label: "UN 3077 Miljöfarligt ämne, fast", radius: 50, info: "Miljöfarligt", type: 'circle' },
  { un: "3082", label: "UN 3082 Miljöfarligt ämne, flytande", radius: 100, info: "Miljöfarligt", type: 'circle' },
  { un: "3257", label: "UN 3257 Varm vätska, N.O.S (Bitumen/Asfalt)", radius: 50, info: "Brännskaderisk", type: 'circle' },
  { un: "3291", label: "UN 3291 Kliniskt avfall", radius: 50, info: "Smittrisk", type: 'circle' },
  { un: "3480", label: "UN 3480 Litiumjonbatterier", radius: 50, info: "Brandfara (Svårsläckt)", type: 'circle' },
];

export const getCardinalDirection = (angle: number): string => {
  const directions = ['N', 'NÖ', 'Ö', 'SÖ', 'S', 'SV', 'V', 'NV'];
  const index = Math.round(((angle %= 360) < 0 ? angle + 360 : angle) / 45) % 8;
  return directions[index];
};
