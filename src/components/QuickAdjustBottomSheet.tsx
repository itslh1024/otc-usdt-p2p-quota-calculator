import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sliders, DollarSign, Percent, TrendingUp, Lock, Unlock, Check } from 'lucide-react';
import { formatNumber } from '../utils/calculator';
import { CurrencyInfo } from '../types';
import { Language, translations } from '../locales/translations';
import { triggerHaptic } from '../utils/haptics';

interface QuickAdjustBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  walletFeeUSDT: number;
  onChangeWalletFee: (val: number) => void;
  conversionFeePercent: number;
  onChangeConversionFee: (val: number) => void;
  profitMarginPercent: number;
  onChangeProfitMargin: (val: number) => void;
  customRateOverride?: number | null;
  onChangeCustomRateOverride: (val: number | null) => void;
  marketRate: number;
  currentCurrency: CurrencyInfo;
}

export const QuickAdjustBottomSheet: React.FC<QuickAdjustBottomSheetProps> = ({
  isOpen,
  onClose,
  language,
  walletFeeUSDT,
  onChangeWalletFee,
  conversionFeePercent,
  onChangeConversionFee,
  profitMarginPercent,
  onChangeProfitMargin,
  customRateOverride,
  onChangeCustomRateOverride,
  marketRate,
  currentCurrency,
}) => {
  const t = translations[language];
  const [isCustomRateActive, setIsCustomRateActive] = useState<boolean>(
    customRateOverride !== null && customRateOverride !== undefined && customRateOverride > 0
  );

  const conversionFeePresets = [2.0, 2.5, 3.0, 3.5, 4.0];
  const profitMarginPresets = [5.0, 10.0, 12.0, 15.0, 18.0, 20.0];

  const handleToggleCustomRate = () => {
    triggerHaptic('medium');
    if (isCustomRateActive) {
      setIsCustomRateActive(false);
      onChangeCustomRateOverride(null);
    } else {
      setIsCustomRateActive(true);
      onChangeCustomRateOverride(marketRate);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
          />

          {/* Bottom Sheet Modal Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative z-10 w-full max-w-xl bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col pb-safe"
          >
            {/* Sheet Handle */}
            <div className="w-full pt-3 pb-1 flex items-center justify-center">
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/60 dark:border-blue-800/60">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {t.feeSettingsTitle}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {t.transferFeeShort}: {walletFeeUSDT}₮ • {t.convFeeShort}: {conversionFeePercent.toFixed(1)}% • {t.profitShort}: +{profitMarginPercent.toFixed(1)}%
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="btn-close-quick-adjust"
                onClick={() => {
                  triggerHaptic('light');
                  onClose();
                }}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl active:bg-slate-100 dark:active:bg-slate-800 touch-manipulation active:scale-95"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Adjustments */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
              {/* Row 1: USDT Wallet Network Transfer Fee */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>{t.walletFeeLabel}</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="50"
                      id="input-sheet-wallet-fee"
                      value={walletFeeUSDT}
                      onChange={(e) => onChangeWalletFee(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-20 min-h-[38px] px-2.5 py-1 text-right text-xs font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                    <span className="text-xs font-bold text-slate-500">USDT</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[0, 1.0, 1.5, 2.0, 3.0].map((fee) => (
                    <button
                      key={fee}
                      type="button"
                      id={`btn-sheet-preset-wallet-fee-${fee}`}
                      onClick={() => {
                        triggerHaptic('light');
                        onChangeWalletFee(fee);
                      }}
                      className={`flex-1 min-h-[38px] px-2 py-1.5 text-xs font-bold rounded-xl transition-all duration-100 touch-manipulation active:scale-95 flex items-center justify-center ${
                        walletFeeUSDT === fee
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      {fee === 1.5 ? t.walletFeeStd : `${fee} ₮`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 2: Currency Conversion / Spread Fee */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>{t.convFeeLabel}</span>
                    </label>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {t.convFeeSub}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="20"
                      id="input-sheet-conversion-fee"
                      value={conversionFeePercent}
                      onChange={(e) => onChangeConversionFee(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-16 min-h-[38px] px-2 py-1 text-right text-xs font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                    <span className="text-xs font-bold text-slate-500">%</span>
                  </div>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min="1.0"
                  max="6.0"
                  step="0.1"
                  id="slider-sheet-conversion-fee"
                  value={conversionFeePercent}
                  onChange={(e) => {
                    triggerHaptic('light');
                    onChangeConversionFee(parseFloat(e.target.value));
                  }}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-2.5 touch-manipulation"
                />

                {/* Presets */}
                <div className="flex items-center justify-between gap-1">
                  {conversionFeePresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      id={`btn-sheet-preset-conv-fee-${preset}`}
                      onClick={() => {
                        triggerHaptic('light');
                        onChangeConversionFee(preset);
                      }}
                      className={`flex-1 min-h-[36px] py-1.5 text-xs font-bold rounded-xl text-center transition-all duration-100 touch-manipulation active:scale-95 flex items-center justify-center ${
                        Math.abs(conversionFeePercent - preset) < 0.05
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      {preset.toFixed(1)}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 3: Custom Merchant Profit Markup */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-blue-200 dark:border-blue-900/60 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span className="text-blue-600 dark:text-blue-400 font-bold">{t.profitMarginLabel}</span>
                    </label>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {t.profitMarginSub}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="30"
                      id="input-sheet-profit-margin"
                      value={profitMarginPercent}
                      onChange={(e) => onChangeProfitMargin(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-16 min-h-[38px] px-2 py-1 text-right text-xs font-bold bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">%</span>
                  </div>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min="0.0"
                  max="30.0"
                  step="0.5"
                  id="slider-sheet-profit-margin"
                  value={profitMarginPercent}
                  onChange={(e) => {
                    triggerHaptic('light');
                    onChangeProfitMargin(parseFloat(e.target.value));
                  }}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-2.5 touch-manipulation"
                />

                {/* Presets */}
                <div className="flex items-center justify-between gap-1">
                  {profitMarginPresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      id={`btn-sheet-preset-profit-${preset}`}
                      onClick={() => {
                        triggerHaptic('light');
                        onChangeProfitMargin(preset);
                      }}
                      className={`flex-1 min-h-[36px] py-1.5 text-xs font-bold rounded-xl text-center transition-all duration-100 touch-manipulation active:scale-95 flex items-center justify-center ${
                        Math.abs(profitMarginPercent - preset) < 0.05
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      +{preset.toFixed(1)}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 4: Custom Exchange Rate Override */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id="btn-sheet-toggle-custom-rate"
                      onClick={handleToggleCustomRate}
                      className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all duration-100 touch-manipulation active:scale-95 ${
                        isCustomRateActive
                          ? 'bg-blue-100 text-blue-900 dark:bg-blue-950/80 dark:text-blue-200 border border-blue-300 dark:border-blue-700 shadow-2xs'
                          : 'bg-white text-slate-700 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {isCustomRateActive ? <Lock className="w-3.5 h-3.5 text-blue-600" /> : <Unlock className="w-3.5 h-3.5 text-slate-500" />}
                      <span>{isCustomRateActive ? t.customRateActive : t.useMarketRate}</span>
                    </button>
                  </div>

                  {isCustomRateActive ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.0001"
                        id="input-sheet-custom-rate"
                        value={customRateOverride || marketRate}
                        onChange={(e) => onChangeCustomRateOverride(parseFloat(e.target.value) || marketRate)}
                        className="w-24 min-h-[38px] px-2 py-1 text-right text-xs font-bold bg-white dark:bg-slate-900 text-blue-900 dark:text-blue-300 border border-blue-300 dark:border-blue-700 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                      <span className="text-xs font-bold text-slate-500">{currentCurrency.code}</span>
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {t.marketSpotRate}: 1 ₮ = {formatNumber(marketRate, 4)} {currentCurrency.code}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Done Button */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <button
                type="button"
                id="btn-sheet-done"
                onClick={() => {
                  triggerHaptic('success');
                  onClose();
                }}
                className="w-full min-h-[48px] py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 touch-manipulation active:scale-[0.98]"
              >
                <Check className="w-4 h-4" />
                <span>{language === 'zh' ? '完成并应用' : 'Done & Apply'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
