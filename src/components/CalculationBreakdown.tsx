import React, { useState } from 'react';
import { CalculationResult } from '../types';
import { Language, translations } from '../locales/translations';
import { formatNumber } from '../utils/calculator';
import { ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface CalculationBreakdownProps {
  result: CalculationResult;
  language: Language;
}

export const CalculationBreakdown: React.FC<CalculationBreakdownProps> = ({ result, language }) => {
  const t = translations[language];
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const {
    targetCurrency,
    grossUSDT,
    walletFeeUSDT,
    netUSDTAfterWalletFee,
    marketRate,
    effectiveRate,
    grossLocalBeforeFees,
    conversionFeeLocal,
    conversionFeePercent,
    profitMarginPercent,
    profitLocal,
    profitUSDT,
    netLocalAmount,
  } = result;

  const rateSpreadPercent = marketRate > 0 && effectiveRate > 0
    ? ((marketRate - effectiveRate) / marketRate) * 100
    : 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-4 transition-colors select-none">
      <button
        type="button"
        id="btn-toggle-breakdown"
        onClick={() => {
          triggerHaptic('light');
          setIsOpen(!isOpen);
        }}
        className="w-full min-h-[48px] px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 active:bg-slate-100 dark:active:bg-slate-800 transition-all text-left touch-manipulation"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/60 dark:border-blue-800/60">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {t.breakdownTitle}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span>{t.effectiveRateLabel}: <strong className="text-slate-800 dark:text-slate-200">1₮ ≈ {formatNumber(effectiveRate, 4)} {targetCurrency.code}</strong></span>
              <span>•</span>
              <span className="text-blue-600 dark:text-blue-400 font-bold">
                {t.netProfitShort}: +{formatNumber(profitUSDT, 2)} ₮ ({targetCurrency.symbol}{formatNumber(profitLocal, targetCurrency.decimals)})
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400 shrink-0">
          <span className="text-[11px] font-medium hidden sm:inline">
            {isOpen ? t.collapse : t.expand}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-3 text-xs">
          {/* Summary Comparison Header */}
          <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">{t.marketBaseRate}</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                1 ₮ = {formatNumber(marketRate, 4)} {targetCurrency.code}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">{t.clientEffectiveRate}</span>
              <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                1 ₮ = {formatNumber(effectiveRate, 4)} {targetCurrency.code}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                {t.spreadImpact}: -{rateSpreadPercent.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Step by step waterfall */}
          <div className="space-y-2 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {/* Step 1: Gross Client Payment */}
            <div className="relative pl-7 flex items-center justify-between">
              <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white dark:ring-slate-900" />
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">1. {t.step1Title}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{t.step1Desc}</p>
              </div>
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                {formatNumber(grossUSDT, 2)} USDT
              </span>
            </div>

            {/* Step 2: Wallet Fee */}
            <div className="relative pl-7 flex items-center justify-between">
              <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-slate-400 ring-4 ring-white dark:ring-slate-900" />
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">2. {t.step2Title}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{t.step2Desc}</p>
              </div>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                -{formatNumber(walletFeeUSDT, 2)} USDT
              </span>
            </div>

            {/* Step 3: Net USDT to Market */}
            <div className="relative pl-7 flex items-center justify-between">
              <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white dark:ring-slate-900" />
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">3. {t.step3Title}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{t.step3Desc}</p>
              </div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {formatNumber(netUSDTAfterWalletFee, 2)} USDT
              </span>
            </div>

            {/* Step 4: Gross Fiat at Market Rate */}
            <div className="relative pl-7 flex items-center justify-between">
              <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-slate-400 ring-4 ring-white dark:ring-slate-900" />
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">4. {t.step4Title}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {t.step4Desc} (1 ₮ = {formatNumber(marketRate, 4)} {targetCurrency.code})
                </p>
              </div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {targetCurrency.symbol}{formatNumber(grossLocalBeforeFees, targetCurrency.decimals)}
              </span>
            </div>

            {/* Step 5: Market Conversion Fee */}
            <div className="relative pl-7 flex items-center justify-between">
              <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-rose-500 ring-4 ring-white dark:ring-slate-900" />
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  5. {t.step5Title} ({conversionFeePercent.toFixed(1)}%)
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{t.step5Desc}</p>
              </div>
              <span className="font-bold text-rose-500">
                -{targetCurrency.symbol}{formatNumber(conversionFeeLocal, targetCurrency.decimals)}
              </span>
            </div>

            {/* Step 6: Merchant Profit Margin */}
            <div className="relative pl-7 flex items-center justify-between bg-blue-50/70 dark:bg-blue-950/40 p-2.5 rounded-2xl -ml-2 border border-blue-100 dark:border-blue-900/40">
              <div className="absolute left-3.5 top-3.5 w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white dark:ring-slate-900" />
              <div className="pl-5">
                <p className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1">
                  <span>6. {t.step6Title} (+{profitMarginPercent.toFixed(1)}%)</span>
                </p>
                <p className="text-[11px] text-blue-700 dark:text-blue-300 font-medium">
                  {t.step6Desc}
                </p>
              </div>
              <div className="text-right">
                <span className="font-bold text-blue-700 dark:text-blue-300 block text-sm">
                  +{targetCurrency.symbol}{formatNumber(profitLocal, targetCurrency.decimals)}
                </span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium block">
                  ≈ +{formatNumber(profitUSDT, 2)} USDT
                </span>
              </div>
            </div>

            {/* Step 7: Final Net Settlement Amount */}
            <div className="relative pl-7 flex items-center justify-between pt-1">
              <div className="absolute left-1.5 top-2.5 w-3 h-3 rounded-full bg-slate-900 dark:bg-white ring-4 ring-white dark:ring-slate-900" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">7. {t.step7Title}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{t.step7Desc}</p>
              </div>
              <span className="font-black text-slate-900 dark:text-white text-base">
                {targetCurrency.symbol}{formatNumber(netLocalAmount, targetCurrency.decimals)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
