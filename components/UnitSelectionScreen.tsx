import React from 'react';

interface UnitSelectionScreenProps {
  username: string;
  onSelectUnit: (unitId: string, unitName: string) => void;
  onLogout: () => void;
}

const UNITS = [
  { id: '9180', name: '9180', color: 'blue', status: 'online', location: 'Sjukvårdsledning City' },
  { id: '9380', name: '9380 CBRN', color: 'emerald', status: 'active', location: 'Sjukvårdsledning Söder' },
  { id: '9580', name: '9580', color: 'amber', status: 'online', location: 'Sjukvårdsledning Solna' },
  { id: '9980', name: '9980', color: 'red', status: 'busy', location: 'On-demand' },
  { id: '9080', name: '9080', color: 'purple', status: 'standby', location: 'On-demand' },
];

const UnitSelectionScreen: React.FC<UnitSelectionScreenProps> = ({ username, onSelectUnit, onLogout }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-200 overflow-y-auto custom-scrollbar">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black -z-10"></div>
      
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center border border-blue-500/30">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
             </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white uppercase tracking-widest">Välj Enhet</h1>
            <p className="text-[10px] text-slate-500 font-mono">INLOGGAD SOM: <span className="text-blue-400">{username.toUpperCase()}</span></p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-300 text-xs font-bold uppercase transition-colors border border-transparent hover:border-red-900"
        >
          Logga ut
        </button>
      </header>

      <main className="max-w-5xl mx-auto p-6 md:p-12">
        <div className="text-center mb-12">
           <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2">Taktisk Indelning</h2>
           <p className="text-slate-400 max-w-lg mx-auto text-sm">
             Välj den enhet du tillhör för att komma åt den delade lägesbilden. Data synkroniseras i realtid mellan alla operatörer i samma enhet.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {UNITS.map((unit) => {
            // Dynamic styles based on unit color
            const colors: Record<string, string> = {
                blue: 'border-blue-500/30 hover:border-blue-500 hover:bg-blue-500/10 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]',
                emerald: 'border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-500/10 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]',
                amber: 'border-amber-500/30 hover:border-amber-500 hover:bg-amber-500/10 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]',
                red: 'border-red-500/30 hover:border-red-500 hover:bg-red-500/10 hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]',
                purple: 'border-purple-500/30 hover:border-purple-500 hover:bg-purple-500/10 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]',
                slate: 'border-slate-500/30 hover:border-slate-400 hover:bg-slate-500/10 hover:shadow-[0_0_30px_rgba(148,163,184,0.2)]',
            };
            
            const statusColors: Record<string, string> = {
                online: 'text-emerald-400',
                active: 'text-blue-400',
                busy: 'text-amber-400',
                offline: 'text-slate-500',
                standby: 'text-slate-400'
            };

            return (
              <button
                key={unit.id}
                onClick={() => onSelectUnit(unit.id, unit.name)}
                className={`
                  relative group bg-slate-900/50 backdrop-blur-sm border rounded-2xl p-6 text-left transition-all duration-300 flex flex-col gap-4 h-48
                  ${colors[unit.color] || colors.slate}
                `}
              >
                <div className="flex justify-between items-start w-full">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-sm text-white shadow-inner">
                        {unit.name.split(' ')[0].substring(0, 4)}
                    </div>
                    <div className={`text-[10px] font-mono uppercase px-2 py-1 rounded bg-slate-950 border border-slate-800 ${statusColors[unit.status]}`}>
                        ● {unit.status.toUpperCase()}
                    </div>
                </div>

                <div className="mt-auto">
                    <h3 className="text-xl font-bold text-white tracking-wide group-hover:translate-x-1 transition-transform">{unit.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <svg className="w-3 h-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                        <span className="text-xs text-slate-400 font-mono">{unit.location}</span>
                    </div>
                </div>
                
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default UnitSelectionScreen;