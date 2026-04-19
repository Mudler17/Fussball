
import React from 'react';
import { Player, Zone } from '../types';
import { PlayerNode } from './PlayerNode';

interface TacticalBoardProps {
  players: Player[];
  selectedPlayerIds: string[];
  togglePlayer: (player: Player) => void;
  swapSourceId?: string | null;
  atmosphere?: boolean; // New prop for visual effects
}

export const TacticalBoard: React.FC<TacticalBoardProps> = ({ players, selectedPlayerIds, togglePlayer, swapSourceId, atmosphere }) => {
  const fieldPlayers = players.filter(p => p.zone !== Zone.BENCH);

  return (
    // Added Atmosphere Glow effect
    <div className={`
        relative w-full aspect-[2/3] md:aspect-[3/4] lg:aspect-[4/3] max-h-[800px] bg-slate-700 rounded-lg shadow-2xl border-4 border-slate-800 z-0 transition-all duration-1000
        ${atmosphere ? 'shadow-[0_0_50px_rgba(16,185,129,0.3)] border-emerald-900' : ''}
    `}>
      
      {/* Inner Pitch Container */}
      <div className="absolute inset-0 overflow-hidden rounded-md">
        {/* Pitch Graphics */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="w-full h-full bg-gradient-to-b from-emerald-900 to-slate-900"></div>
        </div>
        
        {/* Lines */}
        <div className="absolute inset-4 border-2 border-white/10 rounded-sm pointer-events-none"></div>
        
        {/* Atmosphere: Moving lights if active */}
        {atmosphere && (
            <div className="absolute inset-0 pointer-events-none opacity-30">
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-emerald-500 rounded-full blur-[80px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-blue-500 rounded-full blur-[80px] animate-pulse delay-700"></div>
            </div>
        )}

        {/* Midfield Line */}
        <div className="absolute top-1/2 left-4 right-4 h-px bg-white/10 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/10 rounded-full pointer-events-none"></div>

        {/* Goal Areas */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-16 border-2 border-white/10 border-b-0 pointer-events-none"></div>
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-32 h-16 border-2 border-white/10 border-t-0 pointer-events-none"></div>
        
        <div className="absolute top-2 left-0 right-0 text-center pointer-events-none">
            <span className="text-white/20 text-[10px] font-bold tracking-[0.3em] uppercase bg-slate-800/30 px-2 py-0.5 rounded">Wirklichkeit</span>
        </div>
        <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
            <span className="text-white/20 text-[10px] font-bold tracking-[0.3em] uppercase bg-slate-800/30 px-2 py-0.5 rounded">Grundlagen</span>
        </div>

        {/* Arrows / Flows */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="white" />
            </marker>
            </defs>
            <path d="M 20% 35% Q 30% 25% 48% 12%" fill="none" stroke="orange" strokeWidth="1" strokeDasharray="5,5" markerEnd="url(#arrowhead)" />
            <path d="M 30% 65% Q 35% 55% 35% 52%" fill="none" stroke="red" strokeWidth="1" strokeDasharray="5,5" markerEnd="url(#arrowhead)" />
        </svg>
      </div>

      {fieldPlayers.map(player => (
        <PlayerNode 
          key={player.id} 
          player={player} 
          isSelected={selectedPlayerIds.includes(player.id)}
          isSwapTarget={swapSourceId === player.id}
          onToggle={togglePlayer}
        />
      ))}
    </div>
  );
};
