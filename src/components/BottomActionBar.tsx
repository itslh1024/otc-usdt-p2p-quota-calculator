import React from 'react';
import { Sliders, Wallet } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { Language, translations } from '../locales/translations';

interface BottomActionBarProps {
  language: Language;
  onOpenQuickAdjust: () => void;
  onOpenSettings: (initialTab?: 'general' | 'wallets') => void;
  walletsCount: number;
  walletFeeUSDT: number;
  conversionFeePercent: number;
  profitMarginPercent: number;
}

export const BottomActionBar: React.FC<BottomActionBarProps> = ({
  language,
  onOpenQuickAdjust,
  onOpenSettings,
  walletsCount,
  walletFeeUSDT,
  conversionFeePercent,
  profitMarginPercent,
}) => {
  const t = translations[language];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none pb-safe">
      <div className="w-full max-w-xl px-4 pb-3 sm:pb-4 pointer-events-auto">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/90 rounded-2xl shadow-xl p-2 flex items-center gap-2">
          {/* Quick Adjust Button */}
          <button
            type="button"
            id="btn-bottom-quick-adjust"
            onClick={() => {
              triggerHaptic('light');
              onOpenQuickAdjust();
            }}
            className="flex-1 min-h-[46px] px-3.5 py-2 rounded-xl bg-slate-100/90 hover:bg-blue-50 dark:bg-slate-800/90 dark:hover:bg-blue-950/40 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-300 dark:hover:border-blue-800 transition-all flex items-center justify-between text-left group touch-manipulation active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <Sliders className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                  {t.feeSettingsTitle}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate flex items-center gap-1">
                  <span>{walletFeeUSDT}₮</span>
                  <span>•</span>
                  <span>{conversionFeePercent.toFixed(1)}%</span>
                  <span>•</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">+{profitMarginPercent.toFixed(1)}%</span>
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/70 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800 shrink-0">
              {t.expand}
            </span>
          </button>

          {/* Settings & Wallets Button */}
          <button
            type="button"
            id="btn-bottom-settings-wallets"
            onClick={() => {
              triggerHaptic('light');
              onOpenSettings('wallets');
            }}
            className="min-h-[46px] px-3.5 py-2 rounded-xl bg-slate-100/90 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700/90 border border-slate-200/80 dark:border-slate-700/80 transition-all flex items-center gap-2 touch-manipulation active:scale-[0.98] shrink-0"
            title={t.settingsTitle}
          >
            <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-left hidden xs:block sm:block">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {t.tabWallets}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {walletsCount} {language === 'zh' ? '个地址' : 'Wallets'}
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
