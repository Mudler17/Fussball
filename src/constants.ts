
import { Player, PlayerColor, Zone, Opponent } from './types';

export const INITIAL_PLAYERS: Player[] = [
  // --- TOR ---
  {
    id: 'kant',
    name: 'Kant',
    role: 'Transzendentale Kontrolle',
    zone: Zone.GOAL,
    color: PlayerColor.BLUE,
    description: 'Bedingungen der Möglichkeit',
    promptInstruction: 'Prüfe als Immanuel Kant streng die Bedingungen der Möglichkeit. Liegt ein Kategorienfehler vor? Kläre die Grenzen der Vernunft bezüglich dieses Themas.',
    position: { top: '94%', left: '50%' } // Ganz unten
  },
  // --- ABWEHR ---
  {
    id: 'gabriel',
    name: 'Gabriel',
    role: 'Ontologische Grenze',
    zone: Zone.DEFENSE,
    color: PlayerColor.BLUE,
    description: 'Sinnfelder',
    promptInstruction: 'Analysiere als Markus Gabriel die Sinnfelder. In welchem Kontext taucht das Phänomen auf? Verhindere eine reduktionistische Weltsicht ("Weltbild").',
    position: { top: '80%', left: '50%' } // Deutlicher Abstand zu Kant
  },
  {
    id: 'popper',
    name: 'Popper',
    role: 'Kritik & Falsifikation',
    zone: Zone.DEFENSE,
    color: PlayerColor.RED,
    description: 'Falsifizierbarkeit',
    promptInstruction: 'Versuche als Karl Popper, die Annahmen des Problems zu falsifizieren. Wo versteckt sich Pseudowissenschaft oder Dogma? Suche nach dem Gegenbeweis.',
    position: { top: '70%', left: '20%' }
  },
  {
    id: 'foucault',
    name: 'Foucault',
    role: 'Macht & Diskurs',
    zone: Zone.DEFENSE,
    color: PlayerColor.RED,
    description: 'Dispositive',
    promptInstruction: 'Untersuche als Michel Foucault die Machtstrukturen und Dispositive. Wer spricht hier? Welche Normalisierungsstrategien sind am Werk?',
    position: { top: '70%', left: '80%' }
  },
  // --- MITTELFELD ---
  {
    id: 'luhmann',
    name: 'Luhmann',
    role: 'Systemtheorie',
    zone: Zone.MIDFIELD,
    color: PlayerColor.GREEN,
    description: 'System/Umwelt',
    promptInstruction: 'Betrachte als Niklas Luhmann das Problem als System-Umwelt-Differenz. Welcher Code wird verwendet? Wie beobachtet das System sich selbst?',
    position: { top: '55%', left: '30%' } // Etwas breiter
  },
  {
    id: 'latour',
    name: 'Latour',
    role: 'Akteur-Netzwerk',
    zone: Zone.MIDFIELD,
    color: PlayerColor.GREEN,
    description: 'Hybride Netzwerke',
    promptInstruction: 'Folge als Bruno Latour den Akteuren. Unterscheide nicht zwischen Natur und Gesellschaft, sondern zeichne das Netzwerk der Verbindungen nach.',
    position: { top: '55%', left: '70%' } // Etwas breiter
  },
  // --- FLÜGEL / ZENTRUM ---
  {
    id: 'arendt',
    name: 'Arendt',
    role: 'Handlung',
    zone: Zone.WINGS,
    color: PlayerColor.ORANGE,
    description: 'Natalität & Pluralität',
    promptInstruction: 'Frage als Hannah Arendt nach der politischen Dimension. Wie zeigt sich hier Pluralität? Wie kann ein neuer Anfang (Natalität) gemacht werden?',
    position: { top: '40%', left: '15%' }
  },
  {
    id: 'eco',
    name: 'Eco',
    role: 'Interpretation',
    zone: Zone.WINGS,
    color: PlayerColor.YELLOW,
    description: 'Offenes Kunstwerk',
    promptInstruction: 'Analysiere als Umberto Eco die Zeichenprozesse. Wo sind die Grenzen der Interpretation? Unterscheide zwischen Intentio Operis und Intentio Lectoris.',
    position: { top: '40%', left: '50%' } // Deutlich unter Peirce
  },
  {
    id: 'blumenberg',
    name: 'Blumenberg',
    role: 'Metaphorologie',
    zone: Zone.WINGS,
    color: PlayerColor.YELLOW,
    description: 'Umwege & Metaphern',
    promptInstruction: 'Untersuche als Hans Blumenberg die absoluten Metaphern. Welche Bilder leiten das Denken hier unbewusst? Warum reicht der reine Begriff nicht aus?',
    position: { top: '40%', left: '85%' }
  },
  // --- STURM ---
  {
    id: 'peirce',
    name: 'Peirce',
    role: 'Abduktion',
    zone: Zone.ATTACK,
    color: PlayerColor.PURPLE,
    description: 'Kreative Hypothese',
    promptInstruction: 'Nutze als C.S. Peirce die Abduktion. Wage eine kreative Hypothese, die die überraschenden Fakten erklären könnte. Was ist die pragmatische Maxime?',
    position: { top: '22%', left: '50%' } // Zwischen Weber und Eco
  },
  {
    id: 'weber',
    name: 'Weber',
    role: 'Entscheidung',
    zone: Zone.ATTACK,
    color: PlayerColor.ORANGE,
    description: 'Verantwortung',
    promptInstruction: 'Führe als Max Weber eine Entscheidung herbei. Unterscheide Gesinnungs- und Verantwortungsethik. Entzaubere die Situation zur puren Realität.',
    position: { top: '6%', left: '50%' } // Ganz oben
  },
  // --- BANK ---
  {
    id: 'russell',
    name: 'Russell',
    role: 'Logik',
    zone: Zone.BENCH,
    color: PlayerColor.GRAY,
    description: 'Logische Analyse',
    promptInstruction: 'Zerlege als Bertrand Russell die Aussagen logisch atomistisch. Kläre die Begrifflichkeiten präzise.',
    position: { top: '0%', left: '0%' } 
  },
  {
    id: 'vaihinger',
    name: 'Vaihinger',
    role: 'Fiktionalismus',
    zone: Zone.BENCH,
    color: PlayerColor.GRAY,
    description: 'Als-Ob Philosophie',
    promptInstruction: 'Wende als Hans Vaihinger die Philosophie des Als-Ob an. Welche nützlichen Fiktionen helfen uns, das Problem zu bewältigen?',
    position: { top: '0%', left: '0%' }
  },
  {
    id: 'canguilhem',
    name: 'Canguilhem',
    role: 'Norm & Pathologie',
    zone: Zone.BENCH,
    color: PlayerColor.GRAY,
    description: 'Das Normale & das Pathologische',
    promptInstruction: 'Frage als Georges Canguilhem nach der Normativität des Lebens. Was gilt hier als Fehler oder Krankheit und warum?',
    position: { top: '0%', left: '0%' }
  }
];

export const OPPONENTS: Opponent[] = [
  {
    id: 'dogma',
    name: 'FC Dogmatismus',
    description: 'Beharrt auf unveränderlichen Wahrheiten und Tradition.',
    style: 'Starr, autoritär, blockiert Veränderungen.'
  },
  {
    id: 'nihilism',
    name: 'Dynamo Nihilismus',
    description: 'Glaubt an nichts. Alles ist sinnlos.',
    style: 'Destruktiv, verneinend, demotivierend.'
  },
  {
    id: 'relativism',
    name: 'Real Relativismus',
    description: 'Alles ist nur Meinung. Es gibt keine Fakten.',
    style: 'Rutschig, unverbindlich, leugnet Realität.'
  },
  {
    id: 'capitalism',
    name: 'United Kapitalismus',
    description: 'Alles wird zur Ware. Profit ist das einzige Ziel.',
    style: 'Effizient, rücksichtslos, quantifizierend.'
  },
  // New Opponents
  {
    id: 'poststructuralism',
    name: 'FC Poststrukturalismus',
    description: 'Dekonstruktion von Macht und Subjekt. Alles ist Text.',
    style: 'Subversiv, dezentrierend, spielt mit Differenzen.'
  },
  {
    id: 'utilitarianism',
    name: 'SV Utilitarismus',
    description: 'Das größte Glück der größten Zahl. Kosten-Nutzen-Rechnung.',
    style: 'Pragmatisch, kalkulierend, ergebnisorientiert.'
  },
  {
    id: 'empiricism',
    name: 'Empirismus United',
    description: 'Nur das Messbare und die Sinnesdaten zählen.',
    style: 'Datengetrieben, skeptisch gegenüber Metaphysik, beobachtend.'
  },
  {
    id: 'existentialism',
    name: 'Existenzialismus 05',
    description: 'Die Existenz geht der Essenz voraus. Totale Freiheit.',
    style: 'Angstvoll, frei, individuell, rebellisch.'
  }
];

export const INITIAL_QUESTION = "Wie gehen wir mit der Unsicherheit der Zukunft um?";
