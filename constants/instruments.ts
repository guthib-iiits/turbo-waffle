// Powered by OnSpace.AI

export interface Instrument {
  id: number;
  name: string;
  short: string;
}

export const INSTRUMENTS: Instrument[] = [
  { id: 0, name: 'Sine', short: 'SIN' },
  { id: 1, name: 'Square', short: 'SQR' },
  { id: 2, name: 'Sawtooth', short: 'SAW' },
  { id: 3, name: 'Triangle', short: 'TRI' },
  { id: 4, name: 'Organ', short: 'ORG' },
  { id: 5, name: 'Musical Saw', short: 'MSW' },
  { id: 6, name: 'Plucked String', short: 'PLK' },
  { id: 7, name: 'Tabla', short: 'TAB' },
];

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// White key positions (semitone index): C, D, E, F, G, A, B
export const WHITE_NOTES = [0, 2, 4, 5, 7, 9, 11];
// Black key positions with their placement between white keys
export const BLACK_NOTES: { index: number; afterWhite: number }[] = [
  { index: 1, afterWhite: 0 },  // C#
  { index: 3, afterWhite: 1 },  // D#
  { index: 6, afterWhite: 3 },  // F#
  { index: 8, afterWhite: 4 },  // G#
  { index: 10, afterWhite: 5 }, // A#
];
