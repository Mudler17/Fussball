
import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { X, MessageSquare, User, Send, Users, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateLockerRoomTalk } from '../services/geminiService';

interface LockerRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[]; // All players
  activePlayerIds: string[]; // Players who were on the field
  matchReport: string;
}

export const LockerRoomModal: React.FC<LockerRoomModalProps> = ({ isOpen, onClose, players, activePlayerIds, matchReport }) => {
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [coachMessage, setCoachMessage] = useState('');
  const [dialogue, setDialogue] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize selected participants with active players when modal opens
  useEffect(() => {
    if (isOpen && activePlayerIds.length > 0) {
      setSelectedParticipants(activePlayerIds);
      setDialogue(''); // Reset dialogue on new open
    }
  }, [isOpen, activePlayerIds]);

  if (!isOpen) return null;

  const toggleParticipant = (id: string) => {
    setSelectedParticipants(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleTalk = async () => {
    if (!coachMessage.trim() && selectedParticipants.length === 0) return;
    
    setIsGenerating(true);
    const participants = players.filter(p => selectedParticipants.includes(p.id));
    
    const result = await generateLockerRoomTalk(matchReport, participants, coachMessage);
    setDialogue(result);
    setIsGenerating(false);
  };

  const handleDownloadDialogue = () => {
    if (!dialogue) return;
    const date = new Date();
    const filename = `Kabine_Protokoll_${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}.md`;
    
    const element = document.createElement("a");
    const file = new Blob([dialogue], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element); 
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-slate-900 w-full max-w-2xl rounded-xl border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-white font-bold flex items-center gap-2 uppercase tracking-widest text-lg">
            <Users size={20} className="text-slate-400"/> Die Kabine
          </h2>
          <div className="flex gap-2">
            {dialogue && (
              <button 
                onClick={handleDownloadDialogue} 
                className="text-slate-400 hover:text-emerald-400 transition mr-2"
                title="Protokoll speichern"
              >
                <Download size={20} />
              </button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20}/></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* 1. Who is in the discussion? */}
          <div>
            <label className="block text-xs text-slate-500 uppercase font-bold mb-3">Wer diskutiert mit?</label>
            <div className="flex flex-wrap gap-2">
              {players.filter(p => activePlayerIds.includes(p.id)).map(p => (
                <button
                  key={p.id}
                  onClick={() => toggleParticipant(p.id)}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-2
                    ${selectedParticipants.includes(p.id) 
                      ? `${p.color.replace('bg-', 'bg-').replace('500', '600')} text-white border-transparent` 
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'}
                  `}
                >
                  <User size={12} />
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Coach Input */}
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <label className="block text-xs text-emerald-500 uppercase font-bold mb-2 flex items-center gap-2">
              <MessageSquare size={14} /> Trainer-Ansprache
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={coachMessage}
                onChange={(e) => setCoachMessage(e.target.value)}
                placeholder="Lob? Kritik? Eine Frage? (z.B. 'Kant, warum so defensiv?')"
                className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-emerald-500 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleTalk()}
              />
              <button 
                onClick={handleTalk}
                disabled={isGenerating}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white p-2 rounded transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>

          {/* 3. Output Dialogue */}
          {dialogue && (
            <div className="prose prose-invert prose-sm max-w-none bg-black/40 p-4 rounded-lg border border-slate-800/50 shadow-inner">
               <ReactMarkdown>{dialogue}</ReactMarkdown>
            </div>
          )}

          {isGenerating && (
             <div className="flex items-center justify-center py-8 text-slate-500 animate-pulse gap-2">
                <Users size={20} />
                <span>Stimmen werden laut...</span>
             </div>
          )}
          
          {!dialogue && !isGenerating && (
            <div className="text-center py-12 text-slate-600 italic">
              "Was in der Kabine passiert, bleibt in der Kabine..."
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
