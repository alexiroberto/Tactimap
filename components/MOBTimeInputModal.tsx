import React, { useState, useEffect } from 'react';

interface MOBTimeInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (timestamp: number) => void;
}

const MOBTimeInputModal: React.FC<MOBTimeInputModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [time, setTime] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Default to current time
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!time) return;

    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0);

    // If time is in the future, assume it was yesterday (e.g. crossing midnight)
    if (date.getTime() > Date.now()) {
      date.setDate(date.getDate() - 1);
    }

    onSubmit(date.getTime());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-slate-900 border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-red-600"></div>
        
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16Z"/>
            </svg>
            <h2 className="text-xl font-bold tracking-wide text-white">MAN ÖVERBORD</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Tidpunkt för händelse
              </label>
              <input 
                type="time" 
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-2xl font-mono text-white text-center focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                required
              />
              <p className="text-[10px] text-slate-500 mt-2 text-center">
                Driftberäkning startar från denna tidpunkt.
              </p>
            </div>

            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-colors"
              >
                AVBRYT
              </button>
              <button 
                type="submit" 
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-900/20 animate-pulse"
              >
                STARTA SÖK
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MOBTimeInputModal;