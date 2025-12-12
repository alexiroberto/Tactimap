import React, { useState } from 'react';
import { SAFETY_SCENARIOS } from '../constants';

interface ScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: any) => void;
}

const ScenarioModal: React.FC<ScenarioModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  // Filter scenarios if search is active
  const filteredScenarios = searchTerm 
    ? SAFETY_SCENARIOS.map(cat => ({
        ...cat,
        items: cat.items.filter(item => 
          item.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      })).filter(cat => cat.items.length > 0)
    : SAFETY_SCENARIOS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden relative">
        
        {/* Glow Effect */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-500"></div>

        {/* Header */}
        <div className="p-5 border-b border-white/5 bg-slate-900 shrink-0 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">Välj Scenario</h2>
            <p className="text-xs text-slate-400 mt-1">Välj baserat på situation och riskklass</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-slate-900/50 border-b border-white/5 shrink-0">
          <div className="relative">
            <svg className="absolute left-3 top-3 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              placeholder="Sök scenario..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
           <button 
                onClick={() => onSelect({ label: "Anpassad radie", radius: 500, type: 'circle' })}
                className="w-full mb-2 p-4 rounded-xl border border-dashed border-slate-600 hover:border-blue-500 text-slate-400 hover:text-blue-300 hover:bg-blue-500/5 transition-all flex items-center justify-center gap-2"
            >
                <span className="text-sm font-bold uppercase tracking-wider">-- Återställ / Anpassad --</span>
            </button>

            {filteredScenarios.map((category) => {
                const isExpanded = expandedCategory === category.category || searchTerm.length > 0;
                
                return (
                    <div key={category.category} className="mb-2 bg-slate-800/30 border border-white/5 rounded-xl overflow-hidden">
                        <button
                            onClick={() => toggleCategory(category.category)}
                            className={`w-full flex items-center justify-between px-4 py-4 text-left transition-colors ${isExpanded ? 'bg-slate-800' : 'hover:bg-white/5'}`}
                        >
                            <span className="text-sm font-bold text-slate-200">{category.category}</span>
                            {!searchTerm && (
                                <svg className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            )}
                        </button>

                        {isExpanded && (
                            <div className="border-t border-white/5 divide-y divide-white/5">
                                {category.items.map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => onSelect(item)}
                                        className="w-full text-left px-4 py-3 hover:bg-blue-600/10 active:bg-blue-600/20 transition-colors flex flex-col gap-1 group"
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="text-sm text-slate-300 group-hover:text-white font-medium">{item.label}</span>
                                            <span className="ml-2 px-2 py-0.5 bg-slate-900 rounded text-[10px] font-mono text-blue-300 border border-blue-500/30 whitespace-nowrap">
                                                {item.radius}m
                                            </span>
                                        </div>
                                        {item.description && (
                                            <span className="text-xs text-slate-500 group-hover:text-slate-400">{item.description}</span>
                                        )}
                                        {item.innerRadius && (
                                            <span className="text-[10px] text-amber-500/80">
                                                Inre radie: {item.innerRadius}m
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};

export default ScenarioModal;