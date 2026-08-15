import React from 'react';
import { Delete, Check, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { triggerHaptic } from '../utils/haptics';

interface CustomNumpadProps {
  onInputDigit: (digit: string) => void;
  onDelete: () => void;
  onClear: () => void;
  onDone?: () => void;
  quickAddValues?: number[];
  onQuickAdd?: (amount: number) => void;
  isZh?: boolean;
}

export const CustomNumpad: React.FC<CustomNumpadProps> = ({
  onInputDigit,
  onDelete,
  onClear,
  onDone,
  quickAddValues = [1000, 5000, 10000, 50000],
  onQuickAdd,
  isZh = false,
}) => {
  const handlePress = (action: () => void, haptic: 'light' | 'medium' = 'light') => {
    triggerHaptic(haptic);
    action();
  };

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', '00'],
  ];

  return (
    <div className="w-full select-none pt-2">
      {/* Quick Add pills row */}
      {onQuickAdd && quickAddValues.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-3">
          {quickAddValues.map((val) => (
            <motion.button
              key={val}
              whileTap={{ scale: 0.94 }}
              type="button"
              id={`btn-numpad-quickadd-${val}`}
              onClick={() => handlePress(() => onQuickAdd(val), 'light')}
              className="min-h-[42px] py-2 px-1 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/80 dark:border-blue-800/80 rounded-xl transition-colors shadow-2xs touch-manipulation flex items-center justify-center"
            >
              +{isZh && val >= 10000 ? `${val / 10000}万` : val >= 1000 ? `${val / 1000}k` : `${val}`}
            </motion.button>
          ))}
        </div>
      )}

      {/* Grid of keys + Right Action Column */}
      <div className="grid grid-cols-4 gap-2">
        {/* Main 3x4 Keypad Area */}
        <div className="col-span-3 grid grid-cols-3 gap-2">
          {keys.flat().map((k) => (
            <motion.button
              key={k}
              whileTap={{ scale: 0.93 }}
              type="button"
              id={`btn-numpad-key-${k === '.' ? 'dot' : k}`}
              onClick={() => handlePress(() => onInputDigit(k), 'light')}
              className="min-h-[56px] sm:min-h-[60px] text-2xl font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 active:bg-blue-100 dark:active:bg-blue-950/60 rounded-2xl transition-colors shadow-2xs touch-manipulation flex items-center justify-center border border-slate-200/60 dark:border-slate-700/60"
            >
              {k}
            </motion.button>
          ))}
        </div>

        {/* Action Column: Backspace, Clear, Done */}
        <div className="col-span-1 flex flex-col gap-2">
          {/* Backspace */}
          <motion.button
            whileTap={{ scale: 0.93 }}
            type="button"
            id="btn-numpad-backspace"
            onClick={() => handlePress(onDelete, 'light')}
            className="flex-1 min-h-[56px] text-slate-700 dark:text-slate-200 bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-2xl transition-colors shadow-2xs touch-manipulation flex items-center justify-center border border-slate-300/60 dark:border-slate-700/60"
            title="Backspace"
            aria-label="Backspace"
          >
            <Delete className="w-5 h-5" />
          </motion.button>

          {/* Clear */}
          <motion.button
            whileTap={{ scale: 0.93 }}
            type="button"
            id="btn-numpad-clear"
            onClick={() => handlePress(onClear, 'medium')}
            className="min-h-[56px] text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800/80 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-2xl transition-colors shadow-2xs touch-manipulation flex items-center justify-center border border-slate-300/50 dark:border-slate-700/50 gap-1"
            title="Clear all"
            aria-label="Clear All"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isZh ? '清空' : 'C'}</span>
          </motion.button>

          {/* Done / Confirm */}
          {onDone && (
            <motion.button
              whileTap={{ scale: 0.93 }}
              type="button"
              id="btn-numpad-done"
              onClick={() => handlePress(onDone, 'medium')}
              className="flex-1 min-h-[56px] text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-2xl transition-colors shadow-md shadow-blue-600/25 touch-manipulation flex items-center justify-center font-bold text-base border border-blue-500"
              title="Done"
              aria-label="Done"
            >
              <Check className="w-6 h-6 stroke-[3]" />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};
