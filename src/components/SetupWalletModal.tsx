import React, { useState } from 'react';
import { X, Wallet, Check, Clipboard, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { WalletItem, WalletNetwork } from '../types';
import { Language, translations } from '../locales/translations';
import { triggerHaptic } from '../utils/haptics';

interface SetupWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  wallets: WalletItem[];
  onSaveWallets: (wallets: WalletItem[]) => void;
  onProceedToQuote: () => void;
  onSkipToQuote: () => void;
}

interface NetworkMeta {
  id: WalletNetwork;
  label: string;
  desc: string;
  placeholder: string;
  formatHintEn: string;
  formatHintZh: string;
}

const NETWORKS: NetworkMeta[] = [
  {
    id: 'TRC20',
    label: 'TRC20 (Tron)',
    desc: 'Low Fee / Recommended',
    placeholder: 'T...',
    formatHintEn: 'Starts with T (34 characters)',
    formatHintZh: '以 T 开头 (34 位字符)',
  },
  {
    id: 'ERC20',
    label: 'ERC20 (Ethereum)',
    desc: 'Ethereum Mainnet',
    placeholder: '0x...',
    formatHintEn: 'Starts with 0x (42 characters)',
    formatHintZh: '以 0x 开头 (42 位字符)',
  },
  {
    id: 'BEP20',
    label: 'BEP20 (BNB Chain)',
    desc: 'Fast & Low Gas',
    placeholder: '0x...',
    formatHintEn: 'Starts with 0x (42 characters)',
    formatHintZh: '以 0x 开头 (42 位字符)',
  },
  {
    id: 'Polygon',
    label: 'Polygon',
    desc: 'Polygon PoS',
    placeholder: '0x...',
    formatHintEn: 'Starts with 0x (42 characters)',
    formatHintZh: '以 0x 开头 (42 位字符)',
  },
  {
    id: 'Solana',
    label: 'Solana',
    desc: 'High Speed SOL Network',
    placeholder: 'Base58 Address',
    formatHintEn: 'Solana Base58 (32-44 characters)',
    formatHintZh: 'Solana Base58 格式 (32-44 位字符)',
  },
  {
    id: 'Arbitrum',
    label: 'Arbitrum',
    desc: 'Arbitrum One L2',
    placeholder: '0x...',
    formatHintEn: 'Starts with 0x (42 characters)',
    formatHintZh: '以 0x 开头 (42 位字符)',
  },
];

export const SetupWalletModal: React.FC<SetupWalletModalProps> = ({
  isOpen,
  onClose,
  language,
  wallets,
  onSaveWallets,
  onProceedToQuote,
  onSkipToQuote,
}) => {
  const t = translations[language];
  const [selectedNetwork, setSelectedNetwork] = useState<WalletNetwork>('TRC20');
  const [addressInput, setAddressInput] = useState<string>('');
  const [walletName, setWalletName] = useState<string>('');
  const [memoInput, setMemoInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentNetworkMeta = NETWORKS.find((n) => n.id === selectedNetwork) || NETWORKS[0];

  const handlePaste = async () => {
    triggerHaptic('light');
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setAddressInput(text.trim());
          setErrorMessage(null);
          triggerHaptic('success');
        }
      }
    } catch {
      // Clipboard access denied or unsupported in iframe
    }
  };

  const handleSaveAndProceed = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAddr = addressInput.trim();

    if (!cleanAddr) {
      triggerHaptic('warning');
      setErrorMessage(
        language === 'zh'
          ? '请输入或粘贴有效的 USDT 收款钱包地址'
          : 'Please enter or paste a valid USDT deposit address'
      );
      return;
    }

    triggerHaptic('success');

    // Check if a wallet with this network already exists
    const existingIndex = wallets.findIndex((w) => w.network === selectedNetwork);
    let updatedWallets: WalletItem[] = [];

    const defaultName =
      walletName.trim() ||
      (language === 'zh'
        ? `主收款 ${selectedNetwork}`
        : `Main ${selectedNetwork} Wallet`);

    if (existingIndex >= 0) {
      // Update existing wallet
      updatedWallets = wallets.map((w, idx) => {
        if (idx === existingIndex) {
          return {
            ...w,
            name: walletName.trim() || w.name,
            address: cleanAddr,
            memoOrTag: memoInput.trim() || w.memoOrTag,
            isDefault: true,
          };
        }
        return {
          ...w,
          isDefault: false,
        };
      });
    } else {
      // Create new wallet and set as default
      const newWallet: WalletItem = {
        id: 'w_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
        name: defaultName,
        network: selectedNetwork,
        address: cleanAddr,
        memoOrTag: memoInput.trim() || undefined,
        isDefault: true,
        createdAt: Date.now(),
      };
      updatedWallets = [newWallet, ...wallets.map((w) => ({ ...w, isDefault: false }))];
    }

    onSaveWallets(updatedWallets);
    onProceedToQuote();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-blue-50/50 dark:bg-blue-950/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm shadow-blue-600/30 shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  {t.firstTimeSetupTitle}
                </h3>
                <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold rounded-md">
                  {t.firstTimeSetupSub}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {language === 'zh' ? '配置收款地址以生成客户付款单与扫码支付' : 'Setup wallet for instant QR & payment slips'}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-close-setup-wallet-modal"
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl active:bg-slate-100 dark:active:bg-slate-800 touch-manipulation active:scale-95"
            aria-label="Close setup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSaveAndProceed} className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Explanation Banner */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {t.firstTimeSetupDesc}
            </p>
          </div>

          {/* Network Selection */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              {t.networkSelectLabel}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {NETWORKS.map((net) => {
                const isSelected = selectedNetwork === net.id;
                return (
                  <button
                    key={net.id}
                    type="button"
                    id={`btn-select-network-${net.id}`}
                    onClick={() => {
                      triggerHaptic('light');
                      setSelectedNetwork(net.id);
                      setErrorMessage(null);
                    }}
                    className={`min-h-[44px] p-2.5 rounded-xl text-left border transition-all touch-manipulation active:scale-95 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-950/60 border-blue-600 shadow-xs ring-2 ring-blue-600/20'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {net.id}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                    </div>
                    <span className="text-[10px] text-slate-500 truncate mt-0.5">
                      {net.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Deposit Address Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <span>{selectedNetwork} {t.walletAddressLabel}</span>
                <span className="text-rose-500">*</span>
              </label>

              <button
                type="button"
                id="btn-paste-setup-address"
                onClick={handlePaste}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-700 font-bold flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors touch-manipulation"
              >
                <Clipboard className="w-3 h-3" />
                <span>{t.pasteFromClipboard}</span>
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                id="input-setup-wallet-address"
                value={addressInput}
                onChange={(e) => {
                  setAddressInput(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder={currentNetworkMeta.placeholder || t.inputAddressPlaceholder}
                className={`w-full min-h-[46px] p-3 text-xs font-mono rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all ${
                  errorMessage
                    ? 'border-rose-500 ring-1 ring-rose-500/20'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
                autoFocus
              />
            </div>

            {errorMessage ? (
              <p className="text-[11px] text-rose-500 font-bold mt-1 pl-1 flex items-center gap-1">
                <span>⚠️</span> {errorMessage}
              </p>
            ) : (
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 pl-1">
                {language === 'zh' ? currentNetworkMeta.formatHintZh : currentNetworkMeta.formatHintEn}
              </p>
            )}
          </div>

          {/* Optional Wallet Name & Memo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                {t.walletNameLabel} <span className="text-slate-400 font-normal">({language === 'zh' ? '选填' : 'Optional'})</span>
              </label>
              <input
                type="text"
                id="input-setup-wallet-name"
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
                placeholder={`${selectedNetwork} Wallet`}
                className="w-full min-h-[40px] px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                {t.walletMemoLabel} <span className="text-slate-400 font-normal">({language === 'zh' ? '选填' : 'Optional'})</span>
              </label>
              <input
                type="text"
                id="input-setup-wallet-memo"
                value={memoInput}
                onChange={(e) => setMemoInput(e.target.value)}
                placeholder={t.walletMemoPlaceholder}
                className="w-full min-h-[40px] px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Security Note */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{language === 'zh' ? '地址仅保存在您本地浏览器中，绝不上报服务器。' : 'Address is stored locally on your device for fast settlement.'}</span>
          </div>

          {/* Submit Action */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              id="btn-confirm-save-wallet-setup"
              className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all duration-100 flex items-center justify-center gap-2 touch-manipulation active:scale-[0.98]"
            >
              <span>{t.firstTimeSetupBtn}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              id="btn-skip-setup-for-now"
              onClick={() => {
                triggerHaptic('light');
                onSkipToQuote();
              }}
              className="w-full min-h-[40px] py-2 px-3 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl transition-all touch-manipulation"
            >
              {t.skipSetupBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
