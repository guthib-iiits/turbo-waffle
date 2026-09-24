// Powered by OnSpace.AI
// 1-byte BLE protocol encoding for the FPGA synth.

export type BleByte = number;

// Note ON / OFF: [on(1) | octave(3) | noteIndex(4)]
export function encodeNote(on: boolean, octave: number, noteIndex: number): BleByte {
  const o = clamp(octave, 0, 7) & 0b111;
  const n = clamp(noteIndex, 0, 11) & 0b1111;
  const b = ((on ? 1 : 0) << 7) | (o << 4) | n;
  return b & 0xff;
}

// SET INSTRUMENT: [0 | instrumentId(3) | 1100]
export function encodeInstrument(instrumentId: number): BleByte {
  const i = clamp(instrumentId, 0, 7) & 0b111;
  return ((i << 4) | 0b1100) & 0xff;
}

// SET OCTAVE: [0 | octave(3) | 1101]
export function encodeOctave(octave: number): BleByte {
  const o = clamp(octave, 0, 7) & 0b111;
  return ((o << 4) | 0b1101) & 0xff;
}

export function toHex(byte: BleByte): string {
  return '0x' + byte.toString(16).toUpperCase().padStart(2, '0');
}

export function toBinary(byte: BleByte): string {
  return byte.toString(2).padStart(8, '0');
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
