import React, { useState } from 'react';
import { TacticalBoard } from './components/TacticalBoard';
import { ControlPanel } from './components/ControlPanel';
import { PlayerNode } from './components/PlayerNode';
import { HistorySidebar } from './components/HistorySidebar';
import { SettingsModal, PlayerEditorModal } from './components/FeatureModals';
import { LockerRoomModal } from './components/LockerRoomModal';
import {
  generatePhilosophicalAnalysis,
  generateMatchCommentary,
  playAudioBuffer,
} from './services/geminiService';
import { Player, Zone, AnalysisResult, Tactic, AppSettings, Opponent, PlayerFormState } from './types';
import { INITIAL_PLAYERS, INITIAL_QUESTION } from './constants';
import ReactMarkdown from 'react-markdown';
import { Info, X, Brain, History, Download, Microscope, Mic, Save, Users } from 'lucide-react';

const App: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [question, setQuestion] = useState(INITIAL_QUESTION);
  const [tactic, setTactic] = useState<Tactic>(Tactic.BALANCED);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [mode, setMode] = useState<'analyze' | 'substitute'>('analyze');
  const [swapSourceId, setSwapSourceId] = useState<string | null>(null);

  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const [selectedOpponent, setSelectedOpponent] = useState<Opponent | null>(null);
  const [settings, setSettings] = useState<AppSettings>({
    enableTransferMarket: false,
    enableOpponent: false,
    enablePlayerForm: false,
    enableAtmosphere: true,
    enableAudioCommentary: false,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showLockerRoom, setShowLockerRoom] = useState(false);
  const [activeAtmosphere, setActiveAtmosphere] = useState(false);

  const benchPlayers = players.filter((p) => p.zone === Zone.BENCH);

  const handlePlayerClick = (player: Player) => {
    if (mode === 'analyze') {
      setSelectedPlayerIds((prev) =>
        prev.includes(player.id) ? prev.filter((id) => id !== player.id) : [...prev, player.id]
      );
    } else {
      if (!swapSourceId) {
        setSwapSourceId(player.id);
      } else if (swapSourceId === player.id) {
        setSwapSourceId(null);
      } else {
        performSwap(swapSourceId, player.id);
      }
    }
  };

  const performSwap = (id1: string, id2: string) => {
    setPlayers((prev) => {
      const p1 = prev.find((p) => p.id === id1);
      const p2 = prev.find((p) => p.id === id2);
      if (!p1 || !p2) return prev;
      const newP1 = { ...p1, zone: p2.zone, position: p2.position };
      const newP2 = { ...p2, zone: p1.zone, position: p1.position };
      return prev.map((p) => {
        if (p.id === id1) return newP1;
        if (p.id === id2) return newP2;
        return p;
      });
    });
    setSwapSourceId(null);
  };

  const randomizePlayerForms = () => {
    if (!settings.enablePlayerForm) return;
    setPlayers((prev) =>
      prev.map((p) => {
        const rand = Math.random();
        let form: PlayerFormState = 'neutral';
        if (rand > 0.85) form = 'peak';
        else if (rand < 0.15) form = 'slump';
        return { ...p, form };
      })
    );
  };

  const handleAnalyze = async (previousContext?: string) => {
    randomizePlayerForms();
    setIsAnalyzing(true);
    setActiveAtmosphere(false);
    setAudioBlob(null);

    if (!previousContext) setCurrentAnalysis(null);

    const activePlayers = players.filter((p) => selectedPlayerIds.includes(p.id));

    const resultText = await generatePhilosophicalAnalysis(
      question,
      activePlayers,
      tactic,
      settings.enableOpponent ? selectedOpponent : null,
      previousContext
    );

    const finalResponse = previousContext
      ? `${previousContext}\n\n---\n\n### 🔍 VERTIEFUNG / 2. HALBZEIT\n\n${resultText}`
      : resultText;

    const newEntry: AnalysisResult = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      question,
      selectedPlayers: selectedPlayerIds,
      response: finalResponse,
      tactic,
      opponent: settings.enableOpponent && selectedOpponent ? selectedOpponent.name : undefined,
    };

    setCurrentAnalysis(newEntry);
    setHistory((prev) => [newEntry, ...prev]);
    setIsAnalyzing(false);

    if (settings.enableAtmosphere) {
      setActiveAtmosphere(true);
      setTimeout(() => setActiveAtmosphere(false), 5000);
    }

    setTimeout(() => {
      const resultElement = document.getElementById('match-report');
      if (resultElement) resultElement.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleAudioCommentary = async () => {
    if (!currentAnalysis) return;
    setIsGeneratingAudio(true);
    const result = await generateMatchCommentary(currentAnalysis.response, currentAnalysis.question);
    if (result) {
      setAudioBlob(result.blob);
      await playAudioBuffer(result.buffer);
    } else {
      alert('Kommentator ist gerade in der Pause (Fehler bei der Audio-Generierung).');
    }
    setIsGeneratingAudio(false);
  };

  const handleSaveAudio = () => {
    if (!audioBlob) return;
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kommentar-${currentAnalysis?.id || Date.now()}.wav`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeepDive = () => {
    if (currentAnalysis) handleAnalyze(currentAnalysis.response);
  };

  const handleDownload = () => {
    if (!currentAnalysis) return;
    const date = new Date(currentAnalysis.timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const filename = `Philosophie_Spielbericht_${year}-${month}-${day}_${hours}-${minutes}.md`;
    const element = document.createElement('a');
    const file = new Blob([currentAnalysis.response], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const loadHistoryItem = (item: AnalysisResult) => {
    setQuestion(item.question);
    setSelectedPlayerIds(item.selectedPlayers);
    setCurrentAnalysis(item);
    if (item.tactic) setTactic(item.tactic);
    setAudioBlob(null);
    setShowHistory(false);
  };

  const handleAddPlayer = (newPlayer: Player) => {
    setPlayers((prev) => [...prev, newPlayer]);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-emerald-500 selection:text-white">
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} settings={settings} setSettings={setSettings} />
      <PlayerEditorModal isOpen={showEditor} onClose={() => setShowEditor(false)} onAddPlayer={handleAddPlayer} />
      <LockerRoomModal
        isOpen={showLockerRoom}
        onClose={() => setShowLockerRoom(false)}
        players={players}
        activePlayerIds={currentAnalysis ? currentAnalysis.selectedPlayers : []}
        matchReport={currentAnalysis ? currentAnalysis.response : ''}
      />

      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800 p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <span className="text-xl font-bold text-white tracking-tighter">FC PHILOSOPHY</span>
            </div>
            <span className="hidden md:inline text-slate-500 text-sm font-medium border-l border-slate-700 pl-3">
              Taktisches Analyse-Tool
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-2 text-slate-400 hover:text-white px-3 py-1 rounded-md border border-slate-800 hover:border-slate-600 transition"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History size={18} />
              <span className="hidden sm:inline text-sm font-medium">Verlauf</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Col: Field */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-slate-950 p-1 rounded-xl shadow-2xl ring-1 ring-slate-800">
              <TacticalBoard
                players={players}
                selectedPlayerIds={selectedPlayerIds}
                togglePlayer={handlePlayerClick}
                swapSourceId={swapSourceId}
                atmosphere={activeAtmosphere}
              />
            </div>
            <div
              className={`rounded-lg p-4 border border-dashed transition-colors ${
                mode === 'substitute' ? 'bg-purple-900/20 border-purple-500/50' : 'bg-slate-800/50 border-slate-600'
              }`}
            >
              <h4
                className={`text-xs font-bold uppercase tracking-widest mb-3 ${
                  mode === 'substitute' ? 'text-purple-400' : 'text-slate-500'
                }`}
              >
                {mode === 'substitute' ? 'Klicken zum Einwechseln' : 'Ersatzbank / Joker'}
              </h4>
              <div className="flex flex-wrap gap-4 justify-center">
                {benchPlayers.map((p) => (
                  <PlayerNode
                    key={p.id}
                    player={p}
                    isSelected={selectedPlayerIds.includes(p.id)}
                    onToggle={handlePlayerClick}
                    isBench={true}
                    isSwapTarget={swapSourceId === p.id}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Controls & Analysis */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <ControlPanel
              question={question}
              setQuestion={setQuestion}
              selectedPlayerIds={selectedPlayerIds}
              setSelectedPlayerIds={setSelectedPlayerIds}
              onAnalyze={() => handleAnalyze()}
              isAnalyzing={isAnalyzing}
              onClear={() => {}}
              mode={mode}
              setMode={(m) => {
                setMode(m);
                setSwapSourceId(null);
              }}
              players={players}
              tactic={tactic}
              setTactic={setTactic}
              settings={settings}
              onOpenSettings={() => setShowSettings(true)}
              onOpenEditor={() => setShowEditor(true)}
              selectedOpponent={selectedOpponent}
              setSelectedOpponent={setSelectedOpponent}
            />

            <div id="match-report">
              {currentAnalysis ? (
                <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden relative">
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-50 backdrop-blur-sm">
                      <div className="text-emerald-400 font-bold animate-pulse flex items-center gap-2">
                        <Brain className="animate-bounce" /> Denker denken nach...
                      </div>
                    </div>
                  )}
                  <div className="bg-slate-950 p-4 border-b border-slate-700 flex justify-between items-center sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                        <Info size={16} /> Spielbericht
                      </h3>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                        {currentAnalysis.tactic}
                      </span>
                      {currentAnalysis.opponent && (
                        <span className="text-[10px] bg-red-900/50 text-red-300 px-2 py-0.5 rounded border border-red-800">
                          vs. {currentAnalysis.opponent}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {settings.enableAudioCommentary && (
                        <>
                          <button
                            onClick={handleAudioCommentary}
                            disabled={isGeneratingAudio}
                            className={`text-slate-400 hover:text-white transition ${
                              isGeneratingAudio ? 'animate-pulse text-emerald-400' : ''
                            }`}
                            title="Kommentar generieren & hören"
                          >
                            <Mic size={18} />
                          </button>
                          {audioBlob && (
                            <button
                              onClick={handleSaveAudio}
                              className="text-slate-400 hover:text-emerald-400 transition"
                              title="Kommentar als WAV speichern"
                            >
                              <Save size={18} />
                            </button>
                          )}
                        </>
                      )}
                      <button
                        onClick={handleDownload}
                        title="Bericht speichern"
                        className="text-slate-400 hover:text-white transition"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 prose prose-invert prose-emerald max-w-none">
                    <ReactMarkdown>{currentAnalysis.response}</ReactMarkdown>
                  </div>

                  <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex flex-wrap justify-center gap-4">
                    <button
                      onClick={handleDeepDive}
                      disabled={isAnalyzing}
                      className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold text-sm transition-all shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Microscope size={16} />
                      Spielzug vertiefen
                    </button>
                    <button
                      onClick={() => setShowLockerRoom(true)}
                      className="flex items-center gap-2 px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-full font-bold text-sm transition-all shadow-lg border border-slate-600"
                    >
                      <Users size={16} />
                      In die Kabine
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center p-12 text-slate-600 border-2 border-dashed border-slate-800 rounded-lg">
                  <Brain size={48} className="mb-4 opacity-50" />
                  <p className="text-lg font-medium">Warte auf Anpfiff...</p>
                  <p className="text-sm">Wähle Spieler, Taktik und Thema.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* History Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 w-80 bg-slate-900 shadow-2xl transform transition-transform duration-300 z-50 border-l border-slate-700 ${
          showHistory ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-4">
            <h2 className="font-bold text-white">Spielverlauf</h2>
            <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-white">
              <X />
            </button>
          </div>
          <HistorySidebar history={history} onSelect={loadHistoryItem} currentId={currentAnalysis?.id} />
        </div>
      </div>

      {showHistory && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowHistory(false)}></div>}
    </div>
  );
};

export default App;
