// Powered by OnSpace.AI
import React from 'react';
import Svg, { Path, Circle, Rect, Line, Polyline } from 'react-native-svg';

interface Props {
  id: number;
  size?: number;
  color: string;
}

// Custom instrument pictograms drawn with react-native-svg.
export function InstrumentIcon({ id, size = 28, color }: Props) {
  const s = size;
  const stroke = color;
  const sw = Math.max(1.5, s * 0.08);

  switch (id) {
    case 0: // Sine
      return (
        <Svg width={s} height={s} viewBox="0 0 32 32">
          <Path d="M2 16 Q 9 4 16 16 T 30 16" stroke={stroke} strokeWidth={sw} fill="none" strokeLinecap="round" />
        </Svg>
      );
    case 1: // Square
      return (
        <Svg width={s} height={s} viewBox="0 0 32 32">
          <Polyline points="2,22 2,10 10,10 10,22 18,22 18,10 26,10 26,22 30,22" stroke={stroke} strokeWidth={sw} fill="none" strokeLinejoin="miter" strokeLinecap="round" />
        </Svg>
      );
    case 2: // Sawtooth
      return (
        <Svg width={s} height={s} viewBox="0 0 32 32">
          <Polyline points="2,22 10,6 10,22 20,6 20,22 30,6" stroke={stroke} strokeWidth={sw} fill="none" strokeLinejoin="miter" strokeLinecap="round" />
        </Svg>
      );
    case 3: // Triangle
      return (
        <Svg width={s} height={s} viewBox="0 0 32 32">
          <Polyline points="2,22 8,6 16,22 24,6 30,22" stroke={stroke} strokeWidth={sw} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        </Svg>
      );
    case 4: // Organ pipes
      return (
        <Svg width={s} height={s} viewBox="0 0 32 32">
          <Rect x="3" y="14" width="4" height="14" stroke={stroke} strokeWidth={sw} fill="none" />
          <Rect x="9" y="8" width="4" height="20" stroke={stroke} strokeWidth={sw} fill="none" />
          <Rect x="15" y="4" width="4" height="24" stroke={stroke} strokeWidth={sw} fill="none" />
          <Rect x="21" y="10" width="4" height="18" stroke={stroke} strokeWidth={sw} fill="none" />
          <Rect x="27" y="16" width="3" height="12" stroke={stroke} strokeWidth={sw} fill="none" />
        </Svg>
      );
    case 5: // Musical saw: curved blade + note
      return (
        <Svg width={s} height={s} viewBox="0 0 32 32">
          <Path d="M2 24 Q 12 8 26 12" stroke={stroke} strokeWidth={sw} fill="none" strokeLinecap="round" />
          <Line x1="4" y1="26" x2="8" y2="22" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <Line x1="9" y1="22" x2="13" y2="18" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <Line x1="14" y1="17" x2="18" y2="14" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <Circle cx="26" cy="22" r="3" stroke={stroke} strokeWidth={sw} fill="none" />
          <Line x1="29" y1="22" x2="29" y2="14" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        </Svg>
      );
    case 6: // Plucked string: guitar pick
      return (
        <Svg width={s} height={s} viewBox="0 0 32 32">
          <Path d="M8 6 Q 16 4 24 6 Q 22 20 16 28 Q 10 20 8 6 Z" stroke={stroke} strokeWidth={sw} fill="none" strokeLinejoin="round" />
          <Line x1="16" y1="10" x2="16" y2="22" stroke={stroke} strokeWidth={sw * 0.8} strokeLinecap="round" />
        </Svg>
      );
    case 7: // Tabla: two overlapping drums
      return (
        <Svg width={s} height={s} viewBox="0 0 32 32">
          <Circle cx="11" cy="18" r="7" stroke={stroke} strokeWidth={sw} fill="none" />
          <Circle cx="22" cy="20" r="5" stroke={stroke} strokeWidth={sw} fill="none" />
        </Svg>
      );
    default:
      return null;
  }
}
