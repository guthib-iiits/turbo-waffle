// Powered by OnSpace.AI
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent, GestureResponderEvent } from 'react-native';
import { colors, spacing, radius, typography } from '@/constants/theme';
import { NOTE_NAMES, WHITE_NOTES, BLACK_NOTES } from '@/constants/instruments';

interface Props {
  octave: number;
  onNoteOn: (noteIndex: number) => void;
  onNoteOff: (noteIndex: number) => void;
}

interface KeyRect {
  noteIndex: number;
  x: number;
  y: number;
  w: number;
  h: number;
  isBlack: boolean;
}

// Multi-touch capable one-octave keyboard. Each finger is tracked independently
// via identifier; sliding onto a different key issues a release + press.
export function Keyboard({ octave, onNoteOn, onNoteOff }: Props) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [pressed, setPressed] = useState<Set<number>>(new Set());

  // touchId -> current note index
  const fingerMap = useRef<Map<number, number>>(new Map());

  const rects = useMemo<KeyRect[]>(() => {
    if (size.w === 0 || size.h === 0) return [];
    const whiteCount = WHITE_NOTES.length;
    const whiteW = size.w / whiteCount;
    const whiteH = size.h;
    const blackW = whiteW * 0.62;
    const blackH = whiteH * 0.62;

    const list: KeyRect[] = [];
    WHITE_NOTES.forEach((noteIndex, i) => {
      list.push({
        noteIndex,
        x: i * whiteW,
        y: 0,
        w: whiteW,
        h: whiteH,
        isBlack: false,
      });
    });
    BLACK_NOTES.forEach(({ index, afterWhite }) => {
      const cx = (afterWhite + 1) * whiteW;
      list.push({
        noteIndex: index,
        x: cx - blackW / 2,
        y: 0,
        w: blackW,
        h: blackH,
        isBlack: true,
      });
    });
    return list;
  }, [size]);

  const hitTest = useCallback((x: number, y: number): number | null => {
    // Black keys first (they overlay white keys)
    for (const r of rects) {
      if (!r.isBlack) continue;
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return r.noteIndex;
    }
    for (const r of rects) {
      if (r.isBlack) continue;
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) return r.noteIndex;
    }
    return null;
  }, [rects]);

  const setKeyPressed = useCallback((note: number, on: boolean) => {
    setPressed((prev) => {
      const next = new Set(prev);
      if (on) next.add(note); else next.delete(note);
      return next;
    });
  }, []);

  const noteHeldByAnyOther = (note: number, exceptTouchId: number) => {
    for (const [id, n] of fingerMap.current.entries()) {
      if (id === exceptTouchId) continue;
      if (n === note) return true;
    }
    return false;
  };

  const onLayout = (e: LayoutChangeEvent) => {
    setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height });
  };

  const handleTouches = useCallback((e: GestureResponderEvent) => {
    const touches = e.nativeEvent.touches;
    const activeIds = new Set<number>();

    for (const t of touches) {
      const id = Number(t.identifier);
      activeIds.add(id);
      const x = t.locationX;
      const y = t.locationY;
      const hit = hitTest(x, y);
      const prev = fingerMap.current.get(id);

      if (hit === null) {
        // Moved off any key: release previous if any
        if (prev !== undefined) {
          fingerMap.current.delete(id);
          if (!noteHeldByAnyOther(prev, id)) {
            setKeyPressed(prev, false);
            onNoteOff(prev);
          }
        }
        continue;
      }

      if (prev === undefined) {
        // New touch on a key
        fingerMap.current.set(id, hit);
        setKeyPressed(hit, true);
        onNoteOn(hit);
      } else if (prev !== hit) {
        // Slid onto a different key
        fingerMap.current.set(id, hit);
        if (!noteHeldByAnyOther(prev, id)) {
          setKeyPressed(prev, false);
          onNoteOff(prev);
        }
        setKeyPressed(hit, true);
        onNoteOn(hit);
      }
    }

    // Release fingers that are no longer present
    for (const [id, note] of Array.from(fingerMap.current.entries())) {
      if (!activeIds.has(id)) {
        fingerMap.current.delete(id);
        if (!noteHeldByAnyOther(note, id)) {
          setKeyPressed(note, false);
          onNoteOff(note);
        }
      }
    }
  }, [hitTest, onNoteOff, onNoteOn, setKeyPressed]);

  const releaseAll = useCallback(() => {
    const held = new Set<number>();
    for (const n of fingerMap.current.values()) held.add(n);
    fingerMap.current.clear();
    held.forEach((n) => {
      setKeyPressed(n, false);
      onNoteOff(n);
    });
  }, [onNoteOff, setKeyPressed]);

  return (
    <View
      style={styles.wrap}
      onLayout={onLayout}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onStartShouldSetResponderCapture={() => true}
      onMoveShouldSetResponderCapture={() => true}
      onResponderGrant={handleTouches}
      onResponderMove={handleTouches}
      onResponderRelease={handleTouches}
      onResponderEnd={handleTouches}
      onResponderTerminate={releaseAll}
      onResponderTerminationRequest={() => false}
    >
      {rects.filter((r) => !r.isBlack).map((r) => {
        const isDown = pressed.has(r.noteIndex);
        return (
          <View
            key={`w-${r.noteIndex}`}
            pointerEvents="none"
            style={[
              styles.whiteKey,
              {
                left: r.x + 2,
                top: r.y + 2,
                width: r.w - 4,
                height: r.h - 4,
                backgroundColor: isDown ? colors.keyWhitePressed : colors.keyWhite,
                shadowOpacity: isDown ? 0.9 : 0.4,
              },
            ]}
          >
            <Text style={[styles.whiteLabel, isDown && { color: '#001318' }]}>
              {NOTE_NAMES[r.noteIndex]}
              <Text style={styles.whiteLabelOctave}>{octave}</Text>
            </Text>
          </View>
        );
      })}
      {rects.filter((r) => r.isBlack).map((r) => {
        const isDown = pressed.has(r.noteIndex);
        return (
          <View
            key={`b-${r.noteIndex}`}
            pointerEvents="none"
            style={[
              styles.blackKey,
              {
                left: r.x,
                top: r.y,
                width: r.w,
                height: r.h,
                backgroundColor: isDown ? colors.keyBlackPressed : colors.keyBlack,
                shadowColor: isDown ? colors.accent : '#000',
                shadowOpacity: isDown ? 0.9 : 0.5,
              },
            ]}
          >
            <Text style={[styles.blackLabel, isDown && { color: '#100010' }]}>
              {NOTE_NAMES[r.noteIndex]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
    backgroundColor: '#050609',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    position: 'relative',
  },
  whiteKey: {
    position: 'absolute',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#c8ccd6',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 10,
    shadowColor: colors.primary,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
  whiteLabel: {
    color: colors.textSubtle,
    fontSize: typography.size.md,
    fontWeight: '700',
    fontFamily: typography.mono,
  },
  whiteLabelOctave: {
    fontSize: 10,
    color: colors.textSubtle,
  },
  blackKey: {
    position: 'absolute',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  blackLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    fontFamily: typography.mono,
  },
});
