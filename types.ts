
export enum Zone {
  GOAL = 'Torraum',
  DEFENSE = 'Abwehr',
  MIDFIELD = 'Mittelfeld',
  WINGS = 'Flügel',
  ATTACK = 'Sturm',
  BENCH = 'Bank'
}

export enum PlayerColor {
  BLUE = 'bg-blue-500',    // Möglichkeits- & Grenzlogik
  RED = 'bg-red-500',      // Kritik, Macht, Falsifikation
  GREEN = 'bg-emerald-500', // Ordnung, Vermittlung, Infrastruktur
  YELLOW = 'bg-yellow-500', // Sinn, Interpretation, Metaphern
  ORANGE = 'bg-orange-500', // Handlung & Verantwortung
  PURPLE = 'bg-purple-500', // Kreative Navigation
  GRAY = 'bg-gray-500'      // Bank
}

export enum Tactic {
  BALANCED = 'Ausgeglichen',
  OFFENSIVE = 'Offensives Pressing',
  DEFENSIVE = 'Catenaccio (Abwehrriegel)',
  POSSESSION = 'Ballbesitz (Tiki-Taka)',
  COUNTER = 'Dialektischer Konter'
}

export type PlayerFormState = 'peak' | 'neutral' | 'slump';

export interface Player {
  id: string;
  name: string;
  role: string;
  zone: Zone;
  color: PlayerColor;
  description: string;
  promptInstruction: string;
  position: { top: string; left: string };
  form?: PlayerFormState; // New: Daily form
}

export interface Opponent {
  id: string;
  name: string;
  description: string;
  style: string;
}

export interface AppSettings {
  enableTransferMarket: boolean;
  enableOpponent: boolean;
  enablePlayerForm: boolean;
  enableAtmosphere: boolean;
  enableAudioCommentary: boolean;
}

export interface AnalysisResult {
  id: string;
  timestamp: number;
  question: string;
  selectedPlayers: string[];
  response: string;
  tactic: Tactic;
  opponent?: string; // New
}
