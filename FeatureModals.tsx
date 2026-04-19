
import React, { useState } from 'react';
import { AppSettings, Player, Zone, PlayerColor } from '../types';
import { X, Save, Settings, Plus, UserPlus } from 'lucide-react';

// --- SETTINGS MODAL ---

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, setSettings }) => {
  if (!isOpen) return null;

  const toggle = (key: keyof AppSettings) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-800 w-full max-w-md rounded-xl border border-slate-600 shadow-2xl overflow-hidden">
        <div className="bg-slate-900 p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-white font-bold flex items-center gap-2"><Settings size={20}/> Einstellungen</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20}/></button>
        </div>
        <div className="p-6 space-y-4">
          
          <ToggleItem 
            label="Transfermarkt / Editor" 
            desc="Erlaube das Erstellen eigener Philosophen."
            active={settings.enableTransferMarket} 
            onToggle={() => toggle('enableTransferMarket')} 
          />
          <ToggleItem 
            label="Gegnerische Mannschaft" 
            desc="Spiele gegen philosophische Gegner (Nihilismus, Dogmatismus...)."
            active={settings.enableOpponent} 
            onToggle={() => toggle('enableOpponent')} 
          />
          <ToggleItem 
            label="Tagesform & Zufall" 
            desc="Spieler können zufällig in Topform oder Formkrise sein."
            active={settings.enablePlayerForm} 
            onToggle={() => toggle('enablePlayerForm')} 
          />
          <ToggleItem 
            label="Live-Kommentar (Audio)" 
            desc="Generiere eine Audio-Zusammenfassung nach dem Spiel."
            active={settings.enableAudioCommentary} 
            onToggle={() => toggle('enableAudioCommentary')} 
          />
           <ToggleItem 
            label="Stadion-Atmosphäre" 
            desc="Visuelle Effekte bei erfolgreichen Spielzügen."
            active={settings.enableAtmosphere} 
            onToggle={() => toggle('enableAtmosphere')} 
          />
          
        </div>
        <div className="p-4 bg-slate-900/50 flex justify-end">
          <button onClick={onClose} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded font-bold">Fertig</button>
        </div>
      </div>
    </div>
  );
};

const ToggleItem = ({ label, desc, active, onToggle }: any) => (
  <div className="flex items-center justify-between">
    <div>
      <h3 className="text-white font-medium">{label}</h3>
      <p className="text-xs text-slate-400">{desc}</p>
    </div>
    <button 
      onClick={onToggle}
      className={`w-12 h-6 rounded-full transition-colors relative ${active ? 'bg-emerald-500' : 'bg-slate-600'}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${active ? 'left-7' : 'left-1'}`}></div>
    </button>
  </div>
);


// --- PLAYER EDITOR MODAL ---

interface PlayerEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPlayer: (p: Player) => void;
}

export const PlayerEditorModal: React.FC<PlayerEditorModalProps> = ({ isOpen, onClose, onAddPlayer }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [description, setDescription] = useState('');
  const [instruction, setInstruction] = useState('');
  const [color, setColor] = useState(PlayerColor.GRAY);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !instruction) return;

    const newPlayer: Player = {
      id: `custom-${Date.now()}`,
      name: name,
      role: role || 'Neuzugang',
      zone: Zone.BENCH,
      color: color,
      description: description || 'Eigener Spieler',
      promptInstruction: instruction,
      position: { top: '0%', left: '0%' } // Doesn't matter for bench
    };
    onAddPlayer(newPlayer);
    onClose();
    // Reset form
    setName(''); setInstruction('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-800 w-full max-w-lg rounded-xl border border-slate-600 shadow-2xl">
         <div className="bg-slate-900 p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-white font-bold flex items-center gap-2"><UserPlus size={20}/> Transfermarkt: Neuer Spieler</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs text-slate-400 uppercase font-bold mb-1">Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" placeholder="z.B. Nietzsche" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs text-slate-400 uppercase font-bold mb-1">Rolle</label>
                <input value={role} onChange={e => setRole(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" placeholder="z.B. Hammer" />
             </div>
             <div>
                <label className="block text-xs text-slate-400 uppercase font-bold mb-1">Farbe</label>
                <select value={color} onChange={e => setColor(e.target.value as PlayerColor)} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white">
                  <option value={PlayerColor.GRAY}>Grau (Bank)</option>
                  <option value={PlayerColor.BLUE}>Blau (Logik)</option>
                  <option value={PlayerColor.RED}>Rot (Kritik)</option>
                  <option value={PlayerColor.ORANGE}>Orange (Tat)</option>
                  <option value={PlayerColor.PURPLE}>Lila (Kreativ)</option>
                </select>
             </div>
          </div>
           <div>
            <label className="block text-xs text-slate-400 uppercase font-bold mb-1">Beschreibung</label>
            <input value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white" placeholder="Kurzbeschreibung" />
          </div>
          <div>
            <label className="block text-xs text-slate-400 uppercase font-bold mb-1">Prompt Instruktion (Wichtig!)</label>
            <textarea value={instruction} onChange={e => setInstruction(e.target.value)} className="w-full h-24 bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm" placeholder="Wie soll die KI diesen Philosophen simulieren?" required />
          </div>
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded font-bold text-white flex justify-center gap-2 items-center">
            <Save size={18} /> Vertrag unterzeichnen
          </button>
        </form>
      </div>
    </div>
  );
}
