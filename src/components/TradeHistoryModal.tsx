import React, { useState } from 'react';
import { X, Trash2, Download, Search, History } from 'lucide-react';
import { TradeRecord } from '../types';
import { Language, translations } from '../locales/translations';
import { formatNumber } from '../utils/calculator';
import { triggerHaptic } from '../utils/haptics';

interface TradeHistoryModalProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  trades: TradeRecord[];
  onClearHistory: () => void;
  onDeleteTrade: (id: string) => void;
}

export const TradeHistoryModal: React.FC<TradeHistoryModalProps> = ({
  language,
  isOpen,
  onClose,
  trades,
  onClearHistory,
  onDeleteTrade,
}) => {
  const t = translations[language];
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!isOpen) return null;

  // Filter trades
  const filteredTrades = trades.filter((tr) => {
    const term = searchTerm.toLowerCase();
    return (
      tr.currencyCode.toLowerCase().includes(term) ||
      (tr.clientName && tr.clientName.toLowerCase().includes(term)) ||
      (tr.note && tr.note.toLowerCase().includes(term)) ||
      tr.grossUSDT.toString().includes(term) ||
      tr.netLocalAmount.toString().includes(term)
    );
  });

  // Calculate totals
  const totalVolumeUSDT = trades.reduce((acc, tr) => acc + (tr.grossUSDT || 0), 0);
  const totalProfitUSDT = trades.reduce((acc, tr) => acc + (tr.profitUSDT || 0), 0);
  const totalProfitRMB = trades.reduce((acc, tr) => acc + (tr.profitLocal || 0), 0);

  const handleExportCSV = () => {
    if (trades.length === 0) return;
    triggerHaptic('success');

    const headers = [
      'ID',
      'Date Time',
      'Mode',
      'Currency',
      'Gross USDT (应付货款)',
      'Cost Base (商品服务成本)',
      'Market Rate',
      'Effective Rate',
      'Conversion Fee %',
      'Margin %',
      'Wallet Fee USDT',
      'Profit USDT',
      'Profit Local',
    ];

    const rows = trades.map((tr) => [
      tr.id,
      new Date(tr.timestamp).toISOString(),
      tr.mode,
      tr.currencyCode,
      tr.grossUSDT.toFixed(2),
      tr.netLocalAmount.toFixed(2),
      tr.marketRate.toFixed(4),
      tr.effectiveRate.toFixed(4),
      tr.conversionFeePercent.toFixed(1),
      tr.profitMarginPercent.toFixed(1),
      tr.walletFeeUSDT.toFixed(2),
      tr.profitUSDT.toFixed(2),
      tr.profitLocal.toFixed(2),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `otc_trades_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0 border border-blue-200/60 dark:border-blue-800/60">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {t.historyModalTitle}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {language === 'zh' ? `共记录 ${trades.length} 笔本地历史订单` : `${trades.length} ${t.historyCountSub}`}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-close-history-modal"
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl active:bg-slate-100 dark:active:bg-slate-800 touch-manipulation active:scale-95"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Summary Card */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white dark:bg-slate-800 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
              <span className="text-[10px] font-semibold text-slate-500 block">{t.totalVolume}</span>
              <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                {formatNumber(totalVolumeUSDT, 2)} ₮
              </span>
            </div>
            <div className="bg-white dark:bg-slate-800 p-2.5 rounded-2xl border border-blue-200 dark:border-blue-900/60 shadow-2xs">
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 block">{t.totalProfitUsdt}</span>
              <span className="text-xs sm:text-sm font-black text-blue-600 dark:text-blue-400">
                +{formatNumber(totalProfitUSDT, 2)} ₮
              </span>
            </div>
            <div className="bg-white dark:bg-slate-800 p-2.5 rounded-2xl border border-blue-200 dark:border-blue-900/60 shadow-2xs">
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 block">{t.totalProfitFiat}</span>
              <span className="text-xs sm:text-sm font-black text-blue-600 dark:text-blue-400">
                +¥{formatNumber(totalProfitRMB, 2)}
              </span>
            </div>
          </div>

          {/* Search bar */}
          <div className="mt-3 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              id="input-search-history"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full min-h-[40px] bg-white dark:bg-slate-800 pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Scrollable list */}
        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {filteredTrades.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">{t.emptyHistory}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {t.emptyHistorySub}
              </p>
            </div>
          ) : (
            filteredTrades.map((trade) => {
              const dateStr = new Date(trade.timestamp).toLocaleString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={trade.id}
                  className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 transition-colors flex items-center justify-between gap-2"
                >
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-white text-xs">
                        {formatNumber(trade.grossUSDT, 2)} USDT ({t.grossUsdtShort})
                      </span>
                      <span className="text-[10px] text-slate-400">→</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
                        {t.costShort}: {trade.currencyCode} {formatNumber(trade.netLocalAmount, 2)}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center gap-2 flex-wrap">
                      <span>{dateStr}</span>
                      <span>•</span>
                      <span>{t.effectiveRateLabel}: 1₮ ≈ {formatNumber(trade.effectiveRate, 4)}</span>
                      <span>•</span>
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">
                        +{formatNumber(trade.profitUSDT, 2)}₮ {t.profitShort}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('medium');
                      onDeleteTrade(trade.id);
                    }}
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center p-2 text-slate-400 hover:text-rose-500 active:bg-slate-200 dark:active:bg-slate-700 rounded-xl transition-all touch-manipulation active:scale-95 shrink-0"
                    title={t.deleteSingleTrade}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between shrink-0">
          <button
            type="button"
            id="btn-export-csv"
            disabled={trades.length === 0}
            onClick={handleExportCSV}
            className="min-h-[44px] px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl active:bg-slate-100 disabled:opacity-40 flex items-center gap-1.5 shadow-2xs touch-manipulation active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>{t.exportCsvBtn}</span>
          </button>

          {trades.length > 0 && (
            <button
              type="button"
              id="btn-clear-all-trades"
              onClick={() => {
                triggerHaptic('warning');
                if (window.confirm(t.confirmClearHistory)) {
                  onClearHistory();
                }
              }}
              className="min-h-[44px] px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 active:bg-rose-50 dark:active:bg-rose-950/40 rounded-xl transition-all touch-manipulation active:scale-95"
            >
              {t.clearHistoryBtn}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
