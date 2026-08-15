import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowUpDown,
  Copy,
  Check,
  DollarSign,
  Coins,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { CalculationMode, CalculationResult, CurrencyInfo } from '../types';
import { Language, translations } from '../locales/translations';
import { SUPPORTED_CURRENCIES } from '../constants/currencies';
import { formatNumber } from '../utils/calculator';
import { triggerHaptic } from '../utils/haptics';
import { CustomNumpad } from './CustomNumpad';
import { SwipeToConfirm } from './ui/SwipeToConfirm';

interface ConverterCardProps {
  language: Language;
  mode: CalculationMode;
  onToggleMode: () => void;
  inputAmount: number;
  onChangeInputAmount: (val: number) => void;
  targetCurrency: CurrencyInfo;
  onSelectCurrency: (curr: CurrencyInfo) => void;
  result: CalculationResult;
  onOpenQuoteModal: () => void;
  copiedQuota: boolean;
  onCopyQuota: () => void;
}

export const ConverterCard: React.FC<ConverterCardProps> = ({
  language,
  mode,
  onToggleMode,
  inputAmount,
  onChangeInputAmount,
  targetCurrency,
  onSelectCurrency,
  result,
  onOpenQuoteModal,
  copiedQuota,
  onCopyQuota,
}) => {
  const t = translations[language];
  const isRmbMode = mode === 'RMB_TO_USDT';
  const lastActionTimeRef = useRef<number>(0);

  // String buffer for precise numpad entry (supports trailing dots or multiple zeros)
  const [inputBuffer, setInputBuffer] = useState<string>(
    inputAmount > 0 ? inputAmount.toString() : ''
  );
  const inputBufferRef = useRef<string>(inputBuffer);
  inputBufferRef.current = inputBuffer;

  // Synchronize string buffer when inputAmount changes externally (e.g. mode swap or reset)
  useEffect(() => {
    if (inputAmount === 0 && inputBuffer !== '0' && inputBuffer !== '0.') {
      inputBufferRef.current = '';
      setInputBuffer('');
    } else if (inputAmount > 0 && parseFloat(inputBuffer || '0') !== inputAmount) {
      const str = inputAmount.toString();
      inputBufferRef.current = str;
      setInputBuffer(str);
    }
  }, [inputAmount]);

  // Debounced safe action helper
  const handleDebouncedAction = useCallback((fn: () => void, hapticType: 'light' | 'medium' | 'success' = 'light', cooldownMs: number = 250) => {
    const now = Date.now();
    if (now - lastActionTimeRef.current < cooldownMs) return;
    lastActionTimeRef.current = now;
    triggerHaptic(hapticType);
    fn();
  }, []);

  // Numpad handlers
  const handleInputDigit = useCallback((digit: string) => {
    const prev = inputBufferRef.current;
    let next = prev;
    if (digit === '.') {
      if (prev.includes('.')) return;
      next = prev === '' ? '0.' : prev + '.';
    } else if (digit === '00') {
      if (prev === '' || prev === '0') {
        next = '0';
      } else {
        if (prev.includes('.') && prev.split('.')[1]?.length >= 4) return;
        next = prev + '00';
      }
    } else {
      if (prev === '0') {
        next = digit;
      } else {
        if (prev.includes('.') && prev.split('.')[1]?.length >= 4) return;
        if (prev.length >= 12) return;
        next = prev + digit;
      }
    }
    inputBufferRef.current = next;
    setInputBuffer(next);
    const num = parseFloat(next);
    onChangeInputAmount(isNaN(num) ? 0 : num);
  }, [onChangeInputAmount]);

  const handleDeleteDigit = useCallback(() => {
    const prev = inputBufferRef.current;
    let next = '';
    if (prev.length > 1) {
      next = prev.slice(0, -1);
    }
    inputBufferRef.current = next;
    setInputBuffer(next);
    const num = parseFloat(next);
    onChangeInputAmount(isNaN(num) ? 0 : num);
  }, [onChangeInputAmount]);

  const handleClear = useCallback(() => {
    inputBufferRef.current = '';
    setInputBuffer('');
    onChangeInputAmount(0);
  }, [onChangeInputAmount]);

  const handleQuickAdd = useCallback((addVal: number) => {
    const current = parseFloat(inputBufferRef.current || '0') || 0;
    const nextVal = current + addVal;
    const nextStr = nextVal.toString();
    inputBufferRef.current = nextStr;
    setInputBuffer(nextStr);
    onChangeInputAmount(nextVal);
  }, [onChangeInputAmount]);

  // Keyboard shortcut listener for desktop users
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in a modal or another input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleInputDigit(e.key);
      } else if (e.key === '.') {
        e.preventDefault();
        handleInputDigit('.');
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteDigit();
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInputDigit, handleDeleteDigit, handleClear]);

  const quickAddPresets = isRmbMode ? [1000, 5000, 10000, 50000] : [100, 500, 1000, 5000];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 mb-4 transition-colors select-none">
      {/* Header Bar: Currency & Mode Status */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ring-4 ring-blue-600/15 animate-pulse" />
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-wide uppercase">
            {isRmbMode ? (
              <span className="flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-blue-600" />
                <span>{t.costInputLabel}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                <span>{t.usdtInputLabel}</span>
              </span>
            )}
          </span>
        </div>

        {/* Currency Selector Pill */}
        <div className="relative">
          <select
            id="select-target-currency"
            aria-label="Select Target Currency"
            value={targetCurrency.code}
            onChange={(e) => {
              triggerHaptic('light');
              const found = SUPPORTED_CURRENCIES.find((c) => c.code === e.target.value);
              if (found) onSelectCurrency(found);
            }}
            className="appearance-none bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-900 dark:text-white text-xs font-bold pl-3 pr-8 min-h-[38px] rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer touch-manipulation transition-colors"
          >
            {SUPPORTED_CURRENCIES.map((curr) => (
              <option key={curr.code} value={curr.code}>
                {curr.flag} {curr.code} ({curr.symbol})
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Hero Display & Swap Action Row */}
      <div
        id="hero-input-area"
        className="relative bg-slate-50 dark:bg-slate-950/60 rounded-3xl p-4 sm:p-5 border border-blue-600/80 ring-4 ring-blue-600/10 shadow-md transition-all"
      >
        <div className="flex items-center justify-between gap-3">
          {/* Large Hero Display */}
          <div className="flex-1 overflow-hidden">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-4xl font-extrabold text-slate-400 dark:text-slate-500 shrink-0">
                {isRmbMode ? targetCurrency.symbol : '₮'}
              </span>

              <div className="truncate flex items-baseline">
                <span
                  id="display-hero-amount"
                  className={`text-5xl sm:text-7xl font-black tracking-tight ${
                    inputBuffer
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-300 dark:text-slate-700'
                  }`}
                >
                  {inputBuffer || '0'}
                </span>
                {/* Subtle blinking cursor when Hero Mode is active */}
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="inline-block w-1 sm:w-1.5 h-10 sm:h-14 bg-blue-600 ml-1.5 rounded-full align-middle"
                />
              </div>
            </div>

            <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-2">
              <span>{isRmbMode ? targetCurrency.name : 'Tether USD'}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                {isRmbMode ? t.modeCostToUSDT : t.modeUSDTToCost}
              </span>
            </div>
          </div>

          {/* Prominent Swap Mode Button with Spring Animation */}
          <motion.button
            whileTap={{ scale: 0.88, rotate: 180 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            type="button"
            id="btn-hero-swap-mode"
            onClick={(e) => {
              e.stopPropagation();
              handleDebouncedAction(onToggleMode, 'medium');
            }}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white flex items-center justify-center shadow-lg shadow-blue-600/25 shrink-0 transition-colors border-2 border-white dark:border-slate-800"
            title="Swap Mode (RMB ⇄ USDT)"
            aria-label="Swap Calculation Mode"
          >
            <ArrowUpDown className="w-6 h-6 stroke-[2.5]" />
          </motion.button>
        </div>
      </div>

      {/* Integrated Custom Numpad (always visible - this is the sole input surface now) */}
      <div className="mt-3">
        <CustomNumpad
          onInputDigit={handleInputDigit}
          onDelete={handleDeleteDigit}
          onClear={handleClear}
          quickAddValues={quickAddPresets}
          onQuickAdd={handleQuickAdd}
          isZh={language === 'zh'}
        />
      </div>

      {/* Real-time Result Quote Card */}
      <div className="bg-slate-50 dark:bg-slate-950/70 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 mb-4 mt-4">
        <div className="flex items-center justify-between mb-1 gap-1 flex-wrap">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>{isRmbMode ? t.finalUsdtTitle : `${t.coveredCostTitle} (${targetCurrency.name})`}</span>
          </span>

          <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 border border-blue-200/60 dark:border-blue-800/60 px-2 py-0.5 rounded-lg">
            {t.effectiveRateLabel}: 1 ₮ ≈ {formatNumber(result.effectiveRate, 4)}
          </span>
        </div>

        {/* Calculated Result + Copy Action */}
        <div className="flex items-baseline justify-between mt-1 gap-2">
          <div className="flex items-baseline gap-1.5 truncate">
            <span
              id="calculated-quote-value"
              className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight truncate"
            >
              {isRmbMode
                ? `${formatNumber(result.grossUSDT, 2)}`
                : `${targetCurrency.symbol}${formatNumber(result.netLocalAmount, targetCurrency.decimals)}`}
            </span>
            <span className="text-base sm:text-lg font-bold text-slate-500 dark:text-slate-400 shrink-0">
              {isRmbMode ? 'USDT' : targetCurrency.code}
            </span>
          </div>

          <motion.button
            whileTap={{ scale: 0.94 }}
            type="button"
            id="btn-copy-calculated-quota"
            onClick={() => handleDebouncedAction(onCopyQuota, 'success')}
            className={`min-h-[42px] flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl shadow-xs transition-colors touch-manipulation shrink-0 ${
              copiedQuota
                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
            }`}
          >
            {copiedQuota ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{t.quotaCopied}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>{t.btnCopyQuota}</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Profit & Fee Metric Badges */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 block">
              {t.profitMarginLabel}
            </span>
            <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
              +{targetCurrency.symbol}{formatNumber(result.profitLocal, targetCurrency.decimals)}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
              ≈ +{formatNumber(result.profitUSDT, 2)} USDT (+{result.profitMarginPercent.toFixed(1)}%)
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 block">
              {t.walletFeeLabel}
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              {formatNumber(result.walletFeeUSDT, 1)}₮ + {result.conversionFeePercent.toFixed(1)}%
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
              {targetCurrency.symbol}{formatNumber(result.conversionFeeLocal, targetCurrency.decimals)} {language === 'zh' ? '兑换损耗' : 'Spread/Loss'}
            </span>
          </div>
        </div>
      </div>

      {/* Swipe-to-Confirm: opens QuickQuoteModal, which handles save internally */}
      <SwipeToConfirm
        label={language === 'zh' ? '滑动生成报价单' : 'Swipe to Generate Quote'}
        confirmedLabel={language === 'zh' ? '已生成' : 'Generated'}
        onConfirm={() => handleDebouncedAction(onOpenQuoteModal, 'medium')}
      />
    </div>
  );
};
