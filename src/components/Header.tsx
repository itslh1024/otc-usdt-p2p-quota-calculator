import React from 'react';
import { RefreshCw } from 'lucide-react';
import { RateData, CurrencyInfo } from '../types';
import { Language, translations } from '../locales/translations';
import { formatNumber } from '../utils/calculator';
import { triggerHaptic } from '../utils/haptics';

interface HeaderProps {
  language: Language;
  currentCurrency: CurrencyInfo;
  rateData?: RateData;
  isLoadingRate: boolean;
  onRefreshRate: () => void;
  hasCustomOverride: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  currentCurrency,
  rateData,
  isLoadingRate,
  onRefreshRate,
  hasCustomOverride,
}) => {
  const t = translations[language];
  const currentRate = rateData?.rate || currentCurrency.defaultRateToUSD;
  const isLive = rateData?.isLive ?? false;

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors select-none pt-[max(env(safe-area-inset-top),0.75rem)]">
      <div className="max-w-xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Brand / Logo with Blue Accent */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-600/20 font-bold text-base tracking-tight shrink-0">
            ₮
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
                {t.appTitle}
              </h1>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 rounded border border-blue-200/60 dark:border-blue-800/60">
                {t.p2pDeskBadge}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <span>{t.costBaseSub}: {currentCurrency.code}</span>
              <span>•</span>
              <span>{t.feeSub}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Live Market Rate Ticker Bar */}
      <div className="bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800/80 px-4 py-2 text-xs">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              {isLive ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-400"></span>
              )}
            </span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              1 USDT = {formatNumber(currentRate, 4)} {currentCurrency.code}
            </span>
            {hasCustomOverride && (
              <span className="px-1.5 py-0.2 bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 text-[10px] font-medium rounded">
                {t.rateCustom}
              </span>
            )}
          </div>

          <button
            type="button"
            id="btn-refresh-rates"
            onClick={() => {
              triggerHaptic('light');
              onRefreshRate();
            }}
            disabled={isLoadingRate}
            className="min-h-[32px] flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 transition-all touch-manipulation active:scale-95 px-2 py-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRate ? 'animate-spin text-blue-600' : ''}`} />
            <span>{isLoadingRate ? t.refreshing : t.refreshRate}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
