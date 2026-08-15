import React from 'react';
import { Layers, Sliders, History, Settings } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';
import { Language } from '../locales/translations';

interface BottomActionBarProps {
  language: Language;
  onOpenDetails: () => void;
  onOpenRatesFees: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
}

interface BarButtonProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const BarButton: React.FC<BarButtonProps> = ({ id, icon, label, onClick }) => (
  <button
    type="button"
    id={id}
    onClick={() => {
      triggerHaptic('light');
      onClick();
    }}
    className="flex-1 min-h-[52px] flex flex-col items-center justify-center gap-0.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/60 dark:hover:bg-blue-950/30 active:bg-blue-100/70 dark:active:bg-blue-950/50 transition-colors touch-manipulation active:scale-95"
  >
    <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
    <span className="text-[10px] font-bold leading-none">{label}</span>
  </button>
);

export const BottomActionBar: React.FC<BottomActionBarProps> = ({
  language,
  onOpenDetails,
  onOpenRatesFees,
  onOpenHistory,
  onOpenSettings,
}) => {
  const isZh = language === 'zh';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur border-t border-slate-200 dark:border-slate-800 pb-safe">
      <div className="max-w-xl mx-auto px-2 py-1.5 flex items-stretch justify-between gap-1">
        <BarButton
          id="btn-bottom-details"
          icon={<Layers className="w-5 h-5" />}
          label={isZh ? '明细' : 'Details'}
          onClick={onOpenDetails}
        />
        <BarButton
          id="btn-bottom-rates-fees"
          icon={<Sliders className="w-5 h-5" />}
          label={isZh ? '费率' : 'Rates & Fees'}
          onClick={onOpenRatesFees}
        />
        <BarButton
          id="btn-bottom-history"
          icon={<History className="w-5 h-5" />}
          label={isZh ? '流水' : 'History'}
          onClick={onOpenHistory}
        />
        <BarButton
          id="btn-bottom-settings"
          icon={<Settings className="w-5 h-5" />}
          label={isZh ? '设置' : 'Settings'}
          onClick={onOpenSettings}
        />
      </div>
    </div>
  );
};
