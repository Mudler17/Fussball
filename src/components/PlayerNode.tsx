
import React from 'react';
import { Player } from '../types';
import { Check, ArrowLeftRight, Flame, Snowflake } from 'lucide-react';

interface PlayerNodeProps {
  player: Player;
  isSelected: boolean;
  onToggle: (player: Player) => void;
  isBench?: boolean;
  isSwapTarget?: boolean;
}

export const PlayerNode: React.FC<PlayerNodeProps> = ({ player, isSelected, onToggle, isBench = false, isSwapTarget = false }) => {
  
  const topVal = parseFloat(player.position.top);
  const showTooltipBelow = !isNaN(topVal) && topVal < 20;

  return (
    <div
      onClick={() => onToggle(player)}
      className={`
        absolute flex flex-col items-center justify-center cursor-pointer transition-all duration-300 z-10 group
        ${isBench ? 'relative m-2' : 'transform -translate-x-1/2 -translate-y-1/2'}
        ${!isBench && !isSwapTarget && 'hover:scale-110 hover:z-50'} 
        ${isSwapTarget ? 'scale-125 z-50' : ''}
      `}
      style={!isBench ? { top: player.position.top, left: player.position.left } : {}}
    >
      {/* Tooltip */}
      <div 
        className={`
          absolute w-56 p-3 bg-slate-900/95 backdrop-blur-md border border-slate-600 rounded-lg shadow-2xl 
          opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-[100]
          flex flex-col gap-1 text-left
          ${showTooltipBelow ? 'top-full mt-3' : 'bottom-full mb-3'}
        `}
      >
        <div className="flex justify-between items-start border-b border-slate-700 pb-1 mb-1">
          <h4 className="font-bold text-white text-sm">{player.name}</h4>
          <span className="text-[10px] uppercase font-mono text-slate-400 bg-slate-800 px-1 rounded">{player.role}</span>
        </div>
        
        {player.form === 'peak' && (
          <div className="text-orange-400 text-xs font-bold flex items-center gap-1 my-1"><Flame size={12}/> TOPFORM: Spielt brillant!</div>
        )}
        {player.form === 'slump' && (
          <div className="text-blue-300 text-xs font-bold flex items-center gap-1 my-1"><Snowflake size={12}/> FORMKRISE: Unsicher.</div>
        )}

        <p className="text-xs text-emerald-400 font-medium">{player.description}</p>
        <p className="text-[10px] text-slate-300 italic leading-relaxed mt-1 opacity-80">"{player.promptInstruction.substring(0, 80)}..."</p>
        
        <div 
          className={`
            absolute left-1/2 transform -translate-x-1/2 w-3 h-3 bg-slate-600 rotate-45 border border-slate-600
            ${showTooltipBelow ? '-top-1.5 border-b-0 border-r-0' : '-bottom-1.5 border-t-0 border-l-0'}
          `}
        ></div>
        <div 
          className={`
            absolute left-1/2 transform -translate-x-1/2 w-3 h-3 bg-slate-900 rotate-45
            ${showTooltipBelow ? '-top-1.5' : '-bottom-1.5'}
          `}
        ></div>
      </div>

      {/* Circle Icon */}
      <div 
        className={`
          w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center shadow-lg relative transition-all
          ${player.color} text-white font-bold text-[10px] md:text-xs
          ${isSelected ? 'border-white ring-2 ring-yellow-400 scale-110' : 'border-gray-300 opacity-90'}
          ${isSwapTarget ? 'ring-4 ring-purple-500 animate-pulse border-white' : ''}
        `}
      >
        {isSwapTarget ? <ArrowLeftRight size={18} /> : <span className="drop-shadow-md">{player.name.substring(0, 3).toUpperCase()}</span>}
        
        {/* Form Indicator Badges */}
        {player.form === 'peak' && !isBench && (
          <div className="absolute -top-2 -left-2 bg-orange-500 rounded-full p-1 shadow-lg animate-pulse border border-orange-300">
            <Flame size={10} className="text-white" fill="white" />
          </div>
        )}
        {player.form === 'slump' && !isBench && (
          <div className="absolute -top-2 -left-2 bg-blue-500 rounded-full p-1 shadow-lg border border-blue-300">
            <Snowflake size={10} className="text-white" fill="white" />
          </div>
        )}

        {isSelected && !isSwapTarget && (
          <div className="absolute -top-1 -right-1 bg-yellow-400 text-black rounded-full p-0.5 w-3 h-3 md:w-4 md:h-4 flex items-center justify-center">
            <Check size={10} strokeWidth={4} />
          </div>
        )}
      </div>

      {/* Name Label */}
      <div className={`
        mt-0.5 px-1.5 py-px rounded text-[8px] md:text-[10px] font-bold uppercase tracking-wider shadow-sm text-center whitespace-nowrap
        transition-colors border border-transparent
        ${isSelected || isSwapTarget 
          ? 'bg-yellow-400 text-black border-yellow-500' 
          : 'bg-slate-900/80 text-slate-300 border-slate-700 backdrop-blur-[1px]'}
      `}>
        {player.name}
      </div>
    </div>
  );
};
