import React, { useEffect, useState, useRef } from 'react';
import { X, Copy, Check, QrCode, Share2, Wallet, Clipboard, Sparkles, AlertCircle } from 'lucide-react';
import QRCode from 'qrcode';
import { CalculationResult, WalletItem } from '../types';
import { Language, translations } from '../locales/translations';
import { formatNumber, generateQuoteText } from '../utils/calculator';
import { triggerHaptic } from '../utils/haptics';

interface QuickQuoteModalProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
  result: CalculationResult;
  wallets: WalletItem[];
  merchantName?: string;
  onSaveTrade: () => void;
  onOpenWalletSettings?: () => void;
  onSaveWallets?: (wallets: WalletItem[]) => void;
}

export const QuickQuoteModal: React.FC<QuickQuoteModalProps> = ({
  language,
  isOpen,
  onClose,
  result,
  wallets,
  merchantName = 'OTC Desk',
  onSaveTrade,
  onOpenWalletSettings,
  onSaveWallets,
}) => {
  const t = translations[language];
  const defaultWallet = wallets.find((w) => w.isDefault) || wallets[0] || {
    id: 'default',
    name: language === 'zh' ? '默认钱包' : 'Default Wallet',
    network: 'TRC20',
    address: '',
    isDefault: true,
    createdAt: Date.now(),
  };

  const [selectedWalletId, setSelectedWalletId] = useState<string>(defaultWallet.id);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [quoteLang, setQuoteLang] = useState<'zh' | 'en'>(language);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [copiedAddress, setCopiedAddress] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [inlineAddressInput, setInlineAddressInput] = useState<string>('');
  const [inlineError, setInlineError] = useState<string | null>(null);
  const copyThrottleRef = useRef<number>(0);

  // Sync quoteLang when language prop changes
  useEffect(() => {
    setQuoteLang(language);
  }, [language]);

  // Sync selected wallet if default changes or modal reopens
  useEffect(() => {
    if (isOpen) {
      const def = wallets.find((w) => w.isDefault) || wallets[0];
      if (def) setSelectedWalletId(def.id);
      setInlineAddressInput('');
      setInlineError(null);
    }
  }, [isOpen, wallets]);

  const currentWallet =
    wallets.find((w) => w.id === selectedWalletId) || defaultWallet;

  // Preview (keeps cost & effective rate lines)
  const previewMessage = generateQuoteText(
    result,
    currentWallet.address,
    currentWallet.network,
    quoteLang,
    true
  );

  // Copy-to-clipboard (omits cost & effective rate lines)
  const copyMessage = generateQuoteText(
    result,
    currentWallet.address,
    currentWallet.network,
    quoteLang,
    false
  );

  useEffect(() => {
    if (isOpen && currentWallet.address) {
      QRCode.toDataURL(currentWallet.address, {
        width: 260,
        margin: 1.5,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Failed to render QR Code:', err));
    } else {
      setQrDataUrl('');
    }
  }, [isOpen, currentWallet.address]);

  if (!isOpen) return null;

  const handleCopyQuote = async () => {
    const now = Date.now();
    if (now - copyThrottleRef.current < 300) return;
    copyThrottleRef.current = now;
    triggerHaptic('success');

    try {
      // copy the clipboard-optimized message (no cost/effective rate lines)
      await navigator.clipboard.writeText(copyMessage);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  const handleCopyAddress = async () => {
    if (!currentWallet.address) return;
    const now = Date.now();
    if (now - copyThrottleRef.current < 300) return;
    copyThrottleRef.current = now;
    triggerHaptic('success');

    try {
      await navigator.clipboard.writeText(currentWallet.address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (err) {
      console.error('Address copy failed:', err);
    }
  };

  const handlePasteInlineAddress = async () => {
    triggerHaptic('light');
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setInlineAddressInput(text.trim());
          setInlineError(null);
          triggerHaptic('success');
        }
      }
    } catch {
      // Clipboard blocked
    }
  };

  const handleSaveInlineAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAddr = inlineAddressInput.trim();
    if (!cleanAddr) {
      triggerHaptic('warning');
      setInlineError(language === 'zh' ? '请输入有效的收款地址' : 'Please enter a valid address');
      return;
    }

    if (onSaveWallets) {
      triggerHaptic('success');
      const updated = wallets.map((w) => {
        if (w.id === currentWallet.id) {
          return {
            ...w,
            address: cleanAddr,
          };
        }
        return w;
      });
      onSaveWallets(updated);
      setInlineAddressInput('');
      setInlineError(null);
    }
  };

  const handleSave = () => {
    triggerHaptic('success');
    onSaveTrade();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0 border border-blue-200/60 dark:b[...]">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {t.slipModalTitle}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {merchantName} • {t.slipModalSub}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-close-quote-modal"
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl active:bg-slate-100 dark:active:bg[...]"
            aria-label="Close modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* Main summary card */}
          <div className="bg-blue-50/70 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-200/80 dark:border-blue-800/60 text-center">
            <span className="text-[11px] font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider block">
              {t.totalUsdtPayable}
            </span>
            <div className="my-1">
              <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {formatNumber(result.grossUSDT, 2)}
              </span>
              <span className="text-base font-bold text-blue-600 dark:text-blue-400 ml-1.5">
                USDT ({currentWallet.network})
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              {t.costInputLabel}: <span className="font-bold text-slate-900 dark:text-white">{result.targetCurrency.symbol}{formatNumber(result.netLocalAmount, result.targetCurrency.decimals)} {result.targetCurrency.code}</span>
              {' '}• {t.effectiveRateLabel}: <span className="font-bold text-blue-600 dark:text-blue-400">1 ₮ ≈ {formatNumber(result.effectiveRate, 4)}</span>
            </p>
          </div>

          {/* Wallet Selector if multiple exist */}
          {wallets.length > 1 && (
            <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-1.5 px-1">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t.selectWalletNetwork}:</span>
                </span>
                {onOpenWalletSettings && (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      onOpenWalletSettings();
                    }}
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-bold min-h-[32px] flex items-center px-1">
                    {t.walletConfigBtn}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {wallets.map((w) => {
                  const hasAddr = Boolean(w.address && w.address.trim());
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setSelectedWalletId(w.id);
                        setInlineAddressInput('');
                        setInlineError(null);
                      }}
                      className={`min-h-[44px] p-2 rounded-xl text-left border transition-all duration-100 touch-manipulation active:scale-95 flex flex-col justify-between ${
                        selectedWalletId === w.id
                          ? 'bg-white dark:bg-slate-900 border-blue-600 shadow-xs ring-2 ring-blue-600/30'
                          : 'bg-slate-100/70 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-[11px] text-slate-900 dark:text-white truncate">
                          {w.name}
                        </span>
                        {w.isDefault && (
                          <span className="text-[9px] px-1 py-0.2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold rounded">
                            {t.defaultBadge}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[10px] text-slate-500 font-semibold">
                          {w.network}
                        </span>
                        {!hasAddr && (
                          <span className="text-[9px] text-rose-500 font-bold">
                            {t.addressNotSetBadge}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* QR Code + Address OR Inline Setup */}
          {currentWallet.address ? (
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
              <div className="flex justify-center mb-2">
                {qrDataUrl ? (
                  <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-100">
                    <img
                      src={qrDataUrl}
                      alt="USDT Wallet QR Code"
                      className="w-38 h-38 sm:w-40 sm:h-40 object-contain rounded"
                    />
                  </div>
                ) : (
                  <div className="w-38 h-38 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-xl flex items-center justify-center text-slate-400">
                    Generating QR...
                  </div>
                )}
              </div>

              <div className="mt-2 text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <span>{currentWallet.name} ({currentWallet.network}):</span>
                  </span>
                  <button
                    type="button"
                    id="btn-copy-address-slip"
                    onClick={handleCopyAddress}
                    className="min-h-[36px] px-2 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 active:bg-blue-50 dark:active:bg-blue-950/60 rounded-lg flex items-cen[...]">
                    {copiedAddress ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAddress ? t.copiedAddrBtn : t.copyAddrBtn}</span>
                  </button>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-[11px] break-all text-slate-800 dark:text-slate-200 select[...]">
                  {currentWallet.address}
                </div>
                {currentWallet.memoOrTag && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 pl-1">
                    Tag/Memo: {currentWallet.memoOrTag}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {currentWallet.name} ({currentWallet.network}) {t.addressNotSetBadge}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3">
                {t.quickSetAddressDesc}
              </p>

              <form onSubmit={handleSaveInlineAddress} className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={inlineAddressInput}
                      onChange={(e) => {
                        setInlineAddressInput(e.target.value);
                        if (inlineError) setInlineError(null);
                      }}
                      placeholder={`Enter ${currentWallet.network} address...`}
                      className={`w-full min-h-[42px] px-3 text-xs font-mono rounded-xl border bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring[...] ${inlineError ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'}`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handlePasteInlineAddress}
                    className="min-h-[42px] px-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs flex items-center gap-1 hover:bg-slate-300 transiti[...]">
                    <Clipboard className="w-3.5 h-3.5" />
                    <span>{t.pasteFromClipboard}</span>
                  </button>
                </div>

                {inlineError && (
                  <p className="text-[10px] text-rose-600 font-bold">{inlineError}</p>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 min-h-[42px] px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shad[...]">
                    <Check className="w-3.5 h-3.5" />
                    <span>{t.saveAndApply}</span>
                  </button>

                  {onOpenWalletSettings && (
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        onOpenWalletSettings();
                      }}
                      className="min-h-[42px] px-3 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-bold text-xs transition-colors touch-manipulation">
                      {t.walletConfigBtn}
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Language selector & Text Slip */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.formattedTextTitle}
              </span>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 text-[11px]">
                <button
                  type="button"
                  id="btn-quote-lang-zh"
                  onClick={() => {
                    triggerHaptic('light');
                    setQuoteLang('zh');
                  }}
                  className={`min-h-[30px] px-2.5 py-0.5 rounded-lg font-bold transition-all touch-manipulation ${
                    quoteLang === 'zh'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500'
                  }`}>
                  中文
                </button>
                <button
                  type="button"
                  id="btn-quote-lang-en"
                  onClick={() => {
                    triggerHaptic('light');
                    setQuoteLang('en');
                  }}
                  className={`min-h-[30px] px-2.5 py-0.5 rounded-lg font-bold transition-all touch-manipulation ${
                    quoteLang === 'en'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500'
                  }`}>
                  EN
                </button>
              </div>
            </div>

            <pre className="p-3 bg-slate-100 dark:bg-slate-950 rounded-xl font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap select-all leading-relaxed border border-sla[...]">
              {previewMessage}
            </pre>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex items-center gap-2 shrink-0">
          <button
            type="button"
            id="btn-modal-copy-full-quote"
            onClick={handleCopyQuote}
            className="flex-1 min-h-[48px] py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm [...]">
            {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedText ? t.textSlipCopied : t.copyTextSlip}</span>
          </button>

          <button
            type="button"
            id="btn-modal-save-trade"
            onClick={handleSave}
            className="min-h-[48px] py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all d[...]">
            {isSaved ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            <span>{isSaved ? t.tradeRecorded : t.saveTradeRecord}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
