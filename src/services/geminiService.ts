// Frontend-Service: ruft das eigene Backend auf, NIEMALS direkt Gemini.
// Der API-Key existiert in dieser Datei bewusst nicht – er lebt nur auf dem Server.
import type { Player, Tactic, Opponent } from '../types';

// --- WAV-HEADER UTILS (bleiben clientseitig, damit User den Kommentar runterladen kann) ---
function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
}

function createWavBlob(pcmData: Uint8Array, sampleRate: number = 24000): Blob {
  const headerLength = 44;
  const dataLength = pcmData.length;
  const buffer = new ArrayBuffer(headerLength + dataLength);
  const view = new DataView(buffer);
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);     // PCM
  view.setUint16(22, 1, true);     // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);
  const bytes = new Uint8Array(buffer);
  bytes.set(pcmData, headerLength);
  return new Blob([buffer], { type: 'audio/wav' });
}

async function decodeAudioData(bytes: Uint8Array, sampleRate: number = 24000): Promise<AudioBuffer> {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate });
  const dataInt16 = new Int16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 2);
  const frameCount = dataInt16.length;
  const buffer = ctx.createBuffer(1, frameCount, sampleRate);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i] / 32768.0;
  return buffer;
}

export const playAudioBuffer = async (buffer: AudioBuffer) => {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start(0);
};

// --- HTTP-Helper ---
async function postJSON<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let detail = '';
    try {
      const err = await res.json();
      detail = err?.error || err?.detail || '';
    } catch {}
    throw new Error(`HTTP ${res.status}${detail ? `: ${detail}` : ''}`);
  }
  return res.json() as Promise<T>;
}

// --- PUBLIC API ---

export const generatePhilosophicalAnalysis = async (
  question: string,
  selectedPlayers: Player[],
  tactic: Tactic,
  opponent?: Opponent | null,
  previousContext?: string
): Promise<string> => {
  if (selectedPlayers.length === 0) {
    return 'Bitte wähle mindestens einen Spieler aus, um das Spiel zu beginnen.';
  }
  try {
    const data = await postJSON<{ text: string }>('/api/analyze', {
      question,
      selectedPlayers,
      tactic,
      opponent: opponent || null,
      previousContext: previousContext || null,
    });
    return data.text;
  } catch (err) {
    console.error('Analyse-Fehler:', err);
    return 'Ein Fehler ist aufgetreten. Der Schiedsrichter hat das Spiel unterbrochen.';
  }
};

export interface AudioCommentaryResult {
  buffer: AudioBuffer;
  blob: Blob;
}

export const generateMatchCommentary = async (
  analysisText: string,
  topic: string
): Promise<AudioCommentaryResult | null> => {
  try {
    const data = await postJSON<{ audioBase64: string; sampleRate: number }>(
      '/api/commentary',
      { analysisText, topic }
    );
    if (!data.audioBase64) return null;

    // base64 → Uint8Array
    const binaryString = atob(data.audioBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);

    const buffer = await decodeAudioData(bytes, data.sampleRate || 24000);
    const blob = createWavBlob(bytes, data.sampleRate || 24000);
    return { buffer, blob };
  } catch (err) {
    console.error('Kommentar-Fehler:', err);
    return null;
  }
};

export const generateLockerRoomTalk = async (
  matchReport: string,
  participants: Player[],
  coachMessage: string
): Promise<string> => {
  try {
    const data = await postJSON<{ text: string }>('/api/locker-room', {
      matchReport,
      participants,
      coachMessage,
    });
    return data.text;
  } catch (err) {
    console.error('Kabinen-Fehler:', err);
    return 'In der Kabine herrscht betretenes Schweigen. (Fehler bei der Generierung)';
  }
};
