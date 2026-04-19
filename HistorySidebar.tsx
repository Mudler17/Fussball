import React from 'react';
import { AnalysisResult } from '../types';
import { History, ChevronRight } from 'lucide-react';

interface HistorySidebarProps {
  history: AnalysisResult[];
  onSelect: (item: AnalysisResult) => void;
  currentId?: string;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, onSelect, currentId }) => {
  if (history.length === 0) return null;

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 h-full overflow-y-auto max-h-[600px]">
      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
        <History size={14} /> Spielberichte
      </h3>
      <div className="space-y-3">
        {history.map((item) => (
          <div 
            key={item.id}
            onClick={() => onSelect(item)}
            className={`
              p-3 rounded cursor-pointer transition-all border
              ${currentId === item.id 
                ? 'bg-emerald-900/30 border-emerald-500/50' 
                : 'bg-slate-900 border-slate-700 hover:border-slate-500'}
            `}
          >
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs text-slate-400">
                {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
              <ChevronRight size={12} className="text-slate-600" />
            </div>
            <p className="text-sm text-white font-medium line-clamp-2 leading-tight">
              {item.question}
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {item.selectedPlayers.slice(0, 3).map(pid => (
                <span key={pid} className="inline-block w-2 h-2 rounded-full bg-slate-500"></span>
              ))}
              {item.selectedPlayers.length > 3 && (
                <span className="text-[10px] text-slate-500">+{item.selectedPlayers.length - 3}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
