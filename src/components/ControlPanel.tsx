
import React from 'react';
import { Player, Zone, Tactic, Opponent, AppSettings } from '../types';
import { Users, Shield, Zap, Target, Brain, Trash2, Clipboard, Repeat, CheckCircle, Activity, Swords, Settings, PlusCircle } from 'lucide-react';
import { OPPONENTS } from '../constants';

interface ControlPanelProps {
  question: string;
  setQuestion: (q: string) => void;
  selectedPlayerIds: string[];
  setSelectedPlayerIds: (ids: string[]) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onClear: () => void;
  mode: 'analyze' | 'substitute';
  setMode: (m: 'analyze' | 'substitute') => void;
  players: Player[];
  tactic: Tactic;
  setTactic: (t: Tactic) => void;
  settings: AppSettings;
  onOpenSettings: () => void;
  onOpenEditor: () => void;
  selectedOpponent: Opponent | null;
  setSelectedOpponent: (op: Opponent | null) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ 
  question, setQuestion, selectedPlayerIds, setSelectedPlayerIds, onAnalyze, isAnalyzing, onClear,
  mode, setMode, players, tactic, setTactic, 
  settings, onOpenSettings, onOpenEditor, selectedOpponent, setSelectedOpponent
}) => {

  const selectZone = (zone: Zone) => {
    if (mode === 'substitute') return;
    const zonePlayerIds = players.filter(p => p.zone === zone).map(p => p.id);
    setSelectedPlayerIds(zonePlayerIds);
  };

  const selectAll = () => {
    if (mode === 'substitute') return;
    setSelectedPlayerIds(players.filter(p => p.zone !== Zone.BENCH).map(p => p.id));
  };
  
  const deselectAll = () => setSelectedPlayerIds([]);

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-xl border border-slate-700 flex flex-col gap-6 relative">
      
      {/* Settings Button */}
      <button onClick={onOpenSettings} className="absolute top-4 right-4 text-slate-500 hover:text-white transition">
        <Settings size={20} />
      </button>

      {/* Mode Switcher */}
      <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700 mr-8">
        <button 
          onClick={() => setMode('analyze')}
          className={`flex-1 py-2 px-4 rounded text-sm font-bold flex items-center justify-center gap-2 transition-colors ${mode === 'analyze' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          <CheckCircle size={16} /> Analyse
        </button>
        <button 
          onClick={() => setMode('substitute')}
          className={`flex-1 py-2 px-4 rounded text-sm font-bold flex items-center justify-center gap-2 transition-colors ${mode === 'substitute' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          <Repeat size={16} /> Kader
        </button>
      </div>

      {mode === 'analyze' ? (
        <>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clipboard className="text-yellow-400" />
            Trainer-Anweisungen
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tactic Selector */}
            <div>
              <label className="block text-slate-400 text-xs font-bold mb-2 flex items-center gap-2 uppercase">
                <Activity size={12} /> Eigene Taktik
              </label>
              <select 
                value={tactic} 
                onChange={(e) => setTactic(e.target.value as Tactic)}
                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:ring-2 focus:ring-emerald-500 text-sm"
              >
                <option value={Tactic.BALANCED}>⚖️ Ausgeglichen</option>
                <option value={Tactic.OFFENSIVE}>🔥 Offensives Pressing</option>
                <option value={Tactic.DEFENSIVE}>🛡️ Catenaccio</option>
                <option value={Tactic.POSSESSION}>⚽ Ballbesitz</option>
                <option value={Tactic.COUNTER}>⚡ Konter</option>
              </select>
            </div>

            {/* Opponent Selector (Optional) */}
            {settings.enableOpponent && (
              <div>
                <label className="block text-red-400 text-xs font-bold mb-2 flex items-center gap-2 uppercase">
                  <Swords size={12} /> Gegner
                </label>
                <select 
                  value={selectedOpponent?.id || ''} 
                  onChange={(e) => {
                    const op = OPPONENTS.find(o => o.id === e.target.value) || null;
                    setSelectedOpponent(op);
                  }}
                  className="w-full bg-slate-900 border border-red-900/50 rounded p-2 text-white focus:ring-2 focus:ring-red-500 text-sm"
                >
                  <option value="">-- Kein Gegner (Training) --</option>
                  {OPPONENTS.map(op => (
                    <option key={op.id} value={op.id}>{op.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase mb-2">
              Das Problem / Thema
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Welches Problem soll die Mannschaft bearbeiten?"
              className="w-full h-24 bg-slate-900 border border-slate-600 rounded p-3 text-white focus:ring-2 focus:ring-emerald-500 resize-none text-sm"
            />
          </div>

          {/* Quick Selectors */}
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase mb-2">
              Schnellwahl
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <button onClick={selectAll} className="flex items-center justify-center gap-1 bg-slate-700 hover:bg-slate-600 text-[10px] text-white py-2 rounded transition">
                <Users size={12} /> Alle
              </button>
              <button onClick={() => selectZone(Zone.DEFENSE)} className="flex items-center justify-center gap-1 bg-slate-700 hover:bg-red-900/40 text-[10px] text-red-200 py-2 rounded transition">
                <Shield size={12} /> Abwehr
              </button>
              <button onClick={() => selectZone(Zone.MIDFIELD)} className="flex items-center justify-center gap-1 bg-slate-700 hover:bg-emerald-900/40 text-[10px] text-emerald-200 py-2 rounded transition">
                <Brain size={12} /> Mitte
              </button>
              <button onClick={() => selectZone(Zone.ATTACK)} className="flex items-center justify-center gap-1 bg-slate-700 hover:bg-orange-900/40 text-[10px] text-orange-200 py-2 rounded transition">
                <Target size={12} /> Sturm
              </button>
              <button onClick={() => selectZone(Zone.WINGS)} className="flex items-center justify-center gap-1 bg-slate-700 hover:bg-yellow-900/40 text-[10px] text-yellow-200 py-2 rounded transition">
                <Zap size={12} /> Flügel
              </button>
              <button onClick={deselectAll} className="flex items-center justify-center gap-1 bg-slate-700 hover:bg-slate-600 text-[10px] text-gray-400 py-2 rounded transition">
                <Trash2 size={12} /> Reset
              </button>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing || selectedPlayerIds.length === 0 || !question.trim()}
            className={`
              w-full py-3 rounded-lg font-bold text-lg tracking-wider uppercase shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2
              ${isAnalyzing 
                ? 'bg-slate-600 cursor-not-allowed text-slate-400' 
                : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white'
              }
            `}
          >
             {isAnalyzing ? 'Spiel läuft...' : 'ANPFIFF'}
          </button>
        </>
      ) : (
        <div className="text-center py-8 px-4 bg-slate-900/50 rounded border border-slate-700 border-dashed h-full flex flex-col justify-center items-center">
          <Repeat className="text-purple-400 mb-2" size={32} />
          <h3 className="text-white font-bold mb-2">Wechselmodus</h3>
          <p className="text-slate-400 text-sm mb-6">
            Klicke auf zwei Spieler, um Positionen zu tauschen.
          </p>
          
          {settings.enableTransferMarket && (
            <button onClick={onOpenEditor} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-full text-sm font-bold transition">
              <PlusCircle size={16} /> Neuen Spieler erstellen
            </button>
          )}
        </div>
      )}
    </div>
  );
};
