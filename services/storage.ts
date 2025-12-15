import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, where, setDoc } from 'firebase/firestore';
import { Zone, TacticalMarker } from '../types';

// --- KONFIGURATION ---
// För att aktivera riktig backend:
// 1. Skapa ett projekt på console.firebase.google.com
// 2. Skapa en Firestore Database (Starta i test mode)
// 3. Kopiera din config och ersätt nedan
// 4. Sätt USE_FIREBASE = true

const firebaseConfig = {
  apiKey: "DIN_API_KEY_HÄR",
  authDomain: "ditt-projekt.firebaseapp.com",
  projectId: "ditt-projekt",
  storageBucket: "ditt-projekt.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

// Sätt till true när du lagt in dina nycklar
const USE_FIREBASE = false;

let db: any = null;

if (USE_FIREBASE) {
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase initialized");
  } catch (e) {
    console.error("Firebase init failed:", e);
  }
}

// --- INTERFACE ---

export const StorageService = {
  
  // SUBSCRIBE TO ZONES
  subscribeToZones: (unitId: string, callback: (zones: Zone[]) => void) => {
    if (USE_FIREBASE && db) {
      const q = collection(db, `units/${unitId}/zones`);
      return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Zone[];
        callback(data);
      });
    } else {
      // LocalStorage Polling (Simulation)
      const load = () => {
        try {
          const data = localStorage.getItem(`tactimap_${unitId}_zones`);
          callback(data ? JSON.parse(data) : []);
        } catch(e) { callback([]); }
      };
      load();
      const interval = setInterval(load, 1000);
      return () => clearInterval(interval);
    }
  },

  // SUBSCRIBE TO MARKERS
  subscribeToMarkers: (unitId: string, callback: (markers: TacticalMarker[]) => void) => {
    if (USE_FIREBASE && db) {
      const q = collection(db, `units/${unitId}/markers`);
      return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TacticalMarker[];
        callback(data);
      });
    } else {
      const load = () => {
         try {
          const data = localStorage.getItem(`tactimap_${unitId}_markers`);
          callback(data ? JSON.parse(data) : []);
         } catch(e) { callback([]); }
      };
      load();
      const interval = setInterval(load, 1000);
      return () => clearInterval(interval);
    }
  },

  // ADD ZONE
  addZone: async (unitId: string, zone: Zone) => {
    if (USE_FIREBASE && db) {
      // Use setDoc with the specific ID to ensure consistency if we generate IDs client side
      await setDoc(doc(db, `units/${unitId}/zones`, zone.id), zone);
    } else {
      const key = `tactimap_${unitId}_zones`;
      const current = JSON.parse(localStorage.getItem(key) || '[]');
      localStorage.setItem(key, JSON.stringify([...current, zone]));
    }
  },

  // DELETE ZONE
  deleteZone: async (unitId: string, zoneId: string) => {
    if (USE_FIREBASE && db) {
      await deleteDoc(doc(db, `units/${unitId}/zones`, zoneId));
    } else {
      const key = `tactimap_${unitId}_zones`;
      const current = JSON.parse(localStorage.getItem(key) || '[]') as Zone[];
      localStorage.setItem(key, JSON.stringify(current.filter(z => z.id !== zoneId)));
    }
  },

  // UPDATE ZONE
  updateZone: async (unitId: string, zoneId: string, updates: Partial<Zone>) => {
    if (USE_FIREBASE && db) {
      await updateDoc(doc(db, `units/${unitId}/zones`, zoneId), updates);
    } else {
      const key = `tactimap_${unitId}_zones`;
      const current = JSON.parse(localStorage.getItem(key) || '[]') as Zone[];
      localStorage.setItem(key, JSON.stringify(current.map(z => z.id === zoneId ? { ...z, ...updates } : z)));
    }
  },

  // ADD MARKER
  addMarker: async (unitId: string, marker: TacticalMarker) => {
    if (USE_FIREBASE && db) {
      await setDoc(doc(db, `units/${unitId}/markers`, marker.id), marker);
    } else {
      const key = `tactimap_${unitId}_markers`;
      const current = JSON.parse(localStorage.getItem(key) || '[]');
      localStorage.setItem(key, JSON.stringify([...current, marker]));
    }
  },

  // DELETE MARKER
  deleteMarker: async (unitId: string, markerId: string) => {
    if (USE_FIREBASE && db) {
      await deleteDoc(doc(db, `units/${unitId}/markers`, markerId));
    } else {
      const key = `tactimap_${unitId}_markers`;
      const current = JSON.parse(localStorage.getItem(key) || '[]') as TacticalMarker[];
      localStorage.setItem(key, JSON.stringify(current.filter(m => m.id !== markerId)));
    }
  },

  // CLEAR ALL (For Unit)
  clearAll: async (unitId: string) => {
      if (USE_FIREBASE && db) {
          // Note: Firestore requires deleting documents individually
          alert("Massradering via Firebase är inaktiverat i demo-koden för säkerhet.");
      } else {
          localStorage.removeItem(`tactimap_${unitId}_zones`);
          localStorage.removeItem(`tactimap_${unitId}_markers`);
      }
  }
};