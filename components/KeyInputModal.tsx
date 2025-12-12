import React, { useState } from 'react';

interface KeyInputModalProps {
  onSubmit: (key: string) => void;
}

const KeyInputModal: React.FC<KeyInputModalProps> = ({ onSubmit }) => {
  const [inputKey, setInputKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputKey.trim()) {
      onSubmit(inputKey.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4">
      <div className="w-full max-w-md relative group">
        
        {/* Glow effect behind modal */}
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
        
        <div className="relative bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-slate-950/50 px-8 py-6 border-b border-white/5 text-center">
            <div className="mx-auto w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3 shadow-inner ring-1 ring-white/10">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Säkerhetszon Manager</h2>
            <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest">Autentisering Krävs</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-2">
              <label htmlFor="apiKey" className="block text-xs font-semibold text-slate-300 ml-1">
                GOOGLE MAPS API KEY
              </label>
              <div className="relative">
                <input
                  id="apiKey"
                  type="password"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="Klistra in nyckel..."
                  className="block w-full pl-4 pr-10 py-3 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono text-sm"
                  autoFocus
                  autoComplete="off"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 px-1">
                Kräver behörighet för "Maps JavaScript API" och "Places API".
              </p>
            </div>

            <button
              type="submit"
              disabled={!inputKey}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
            >
              INITIALISERA SYSTEM
            </button>
          </form>
          
          <div className="bg-slate-950/30 px-6 py-3 border-t border-white/5 flex justify-between items-center text-[10px] text-slate-600 font-mono">
            <span>SECURE CONNECTION</span>
            <span>V 2.1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyInputModal;