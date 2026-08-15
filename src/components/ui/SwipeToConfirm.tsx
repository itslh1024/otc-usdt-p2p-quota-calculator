import React, { useCallback, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { ChevronsRight, Check } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface SwipeToConfirmProps {
  label: string;
  confirmedLabel?: string;
  onConfirm: () => void;
  disabled?: boolean;
  /** Ratio (0-1) of track width the thumb must cross before a release counts as confirmed. Default 0.85 */
  confirmThreshold?: number;
}

const THUMB_SIZE_PX = 48; // matches w-12/h-12
const THUMB_PADDING_PX = 8; // top-1/left-1 (4px) on both sides
const RESET_DELAY_MS = 1200;

export const SwipeToConfirm: React.FC<SwipeToConfirmProps> = ({
  label,
  confirmedLabel,
  onConfirm,
  disabled = false,
  confirmThreshold = 0.85,
}) => {
  const [trackWidth, setTrackWidth] = useState(0);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const x = useMotionValue(0);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const maxDrag = Math.max(0, trackWidth - THUMB_SIZE_PX - THUMB_PADDING_PX);

  const fillWidth = useTransform(x, (v) => `${v + THUMB_SIZE_PX + THUMB_PADDING_PX / 2}px`);
  const labelOpacity = useTransform(x, [0, Math.max(1, maxDrag * 0.6)], [1, 0]);

  const measureTrack = useCallback((node: HTMLDivElement | null) => {
    if (node) setTrackWidth(node.offsetWidth);
  }, []);

  const handleDragEnd = (
    _event: PointerEvent | MouseEvent | TouchEvent,
    info: PanInfo
  ) => {
    if (disabled || maxDrag <= 0) return;
    const completionRatio = x.get() / maxDrag;

    if (completionRatio >= confirmThreshold) {
      triggerHaptic('success');
      x.set(maxDrag);
      setIsConfirmed(true);
      onConfirm();

      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => {
        x.set(0);
        setIsConfirmed(false);
      }, RESET_DELAY_MS);
    } else {
      triggerHaptic('light');
      x.set(0);
    }
  };

  return (
    <div
      ref={measureTrack}
      className={`relative w-full min-h-[56px] rounded-2xl overflow-hidden select-none ${
        disabled ? 'bg-slate-100 dark:bg-slate-800 opacity-60' : 'bg-slate-100 dark:bg-slate-800'
      }`}
    >
      {/* Filled progress trail behind the thumb */}
      <motion.div
        className="absolute inset-y-0 left-0 bg-blue-600/15 dark:bg-blue-500/15 pointer-events-none"
        style={{ width: fillWidth }}
      />

      {/* Center label + hint chevron */}
      {!isConfirmed && (
        <motion.div
          style={{ opacity: labelOpacity }}
          className="absolute inset-0 flex items-center justify-center gap-1.5 text-sm font-bold text-slate-600 dark:text-slate-300 pointer-events-none"
        >
          <span>{label}</span>
          <ChevronsRight className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-pulse" />
        </motion.div>
      )}

      {/* Confirmed state */}
      {isConfirmed && confirmedLabel && (
        <div className="absolute inset-0 flex items-center justify-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 pointer-events-none">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{confirmedLabel}</span>
        </div>
      )}

      {/* Draggable thumb */}
      <motion.div
        drag={disabled || isConfirmed || maxDrag <= 0 ? false : 'x'}
        dragConstraints={{ left: 0, right: maxDrag }}
        dragElastic={0.04}
        dragMomentum={false}
        style={{ x }}
        onDragEnd={handleDragEnd}
        whileTap={disabled ? undefined : { scale: 0.96 }}
        className={`absolute top-1 left-1 w-12 h-12 rounded-xl flex items-center justify-center shadow-md touch-none ${
          isConfirmed
            ? 'bg-emerald-600 text-white'
            : disabled
            ? 'bg-slate-400 text-white'
            : 'bg-blue-600 text-white cursor-grab active:cursor-grabbing'
        }`}
      >
        {isConfirmed ? (
          <Check className="w-5 h-5 stroke-[3]" />
        ) : (
          <ChevronsRight className="w-5 h-5 stroke-[2.5]" />
        )}
      </motion.div>
    </div>
  );
};
