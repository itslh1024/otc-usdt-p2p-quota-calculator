import React, { useState } from 'react';
import {
  X,
  Settings,
  Globe,
  Sun,
  Moon,
  Wallet,
  Building,
  Check,
  Plus,
  Edit2,
  Trash2,
  Star,
  Copy,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Sliders,
} from 'lucide-react';
import { WalletItem, WalletNetwork } from '../types';
import { Language, translations } from '../locales/translations';
import { triggerHaptic } from '../utils/haptics';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  wallets: WalletItem[];
  merchantName: string;
  onSaveWallets: (wallets: WalletItem[]) => void;
  onSaveMerchantName: (name: string) => void;
  initialTab?: 'general' | 'wallets';
}

const NETWORKS: { id: WalletNetwork; label: string; desc: string; badgeBg: string; badgeText: string }[] = [
  {
    id: 'TRC20',
    label: 'TRC20',
    desc: 'Tron (TRX) - Low Fee / Standard',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/70 border-blue-200 dark:border-blue-800',
    badgeText: 'text-blue-700 dark:text-blue-300',
  },
  {
    id: 'ERC20',
    label: 'ERC20',
    desc: 'Ethereum Mainnet (ETH)',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/70 border-blue-200 dark:border-blue-800',
    badgeText: 'text-blue-700 dark:text-blue-300',
  },
  {
    id: 'BEP20',
    label: 'BEP20',
    desc: 'BNB Smart Chain (BSC)',
    badgeBg: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700',
    badgeText: 'text-slate-700 dark:text-slate-300',
  },
  {
    id: 'Polygon',
    label: 'Polygon',
    desc: 'Polygon PoS (MATIC)',
    badgeBg: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700',
    badgeText: 'text-slate-700 dark:text-slate-300',
  },
  {
    id: 'Solana',
    label: 'Solana',
    desc: 'Solana Network (SOL)',
    badgeBg: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700',
    badgeText: 'text-slate-700 dark:text-slate-300',
  },
  {
    id: 'Arbitrum',
    label: 'Arbitrum',
    desc: 'Arbitrum One (L2)',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/70 border-blue-200 dark:border-blue-800',
    badgeText: 'text-blue-700 dark:text-blue-300',
  },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  onSelectLanguage,
  darkMode,
  onToggleDarkMode,
  wallets,
  merchantName,
  onSaveWallets,
  onSaveMerchantName,
  initialTab = 'general',
}) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'general' | 'wallets'>(initialTab);
  const [walletViewMode, setWalletViewMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editingWalletId, setEditingWalletId] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState<string>('');
  const [formNetwork, setFormNetwork] = useState<WalletNetwork>('TRC20');
  const [formAddress, setFormAddress] = useState<string>('');
  const [formMemo, setFormMemo] = useState<string>('');
  const [formIsDefault, setFormIsDefault] = useState<boolean>(false);
  const [deskName, setDeskName] = useState<string>(merchantName);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 2200);
  };

  const handleCopyAddress = async (id: string, addr: string) => {
    triggerHaptic('success');
    try {
      await navigator.clipboard.writeText(addr);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      showFeedback(t.addressCopied);
    }
  };

  // Open Add Wallet Form
  const handleOpenAddForm = () => {
    triggerHaptic('light');
    setFormName('');
    setFormNetwork('TRC20');
    setFormAddress('');
    setFormMemo('');
    setFormIsDefault(wallets.length === 0);
    setWalletViewMode('add');
    setEditingWalletId(null);
  };

  // Open Edit Wallet Form
  const handleOpenEditForm = (wallet: WalletItem) => {
    triggerHaptic('light');
    setEditingWalletId(wallet.id);
    setFormName(wallet.name);
    setFormNetwork(wallet.network);
    setFormAddress(wallet.address);
    setFormMemo(wallet.memoOrTag || '');
    setFormIsDefault(wallet.isDefault);
    setWalletViewMode('edit');
  };

  // Set wallet as default
  const handleSetDefault = (id: string) => {
    triggerHaptic('medium');
    const updated = wallets.map((w) => ({
      ...w,
      isDefault: w.id === id,
    }));
    onSaveWallets(updated);
    showFeedback(t.defaultWalletSet);
  };

  // Delete wallet
  const handleDeleteWallet = (id: string) => {
    if (wallets.length <= 1) {
      triggerHaptic('warning');
      alert(t.atLeastOneWallet);
      return;
    }
    triggerHaptic('medium');
    const target = wallets.find((w) => w.id === id);
    const updated = wallets.filter((w) => w.id !== id);
    if (target?.isDefault && updated.length > 0) {
      updated[0].isDefault = true;
    }
    onSaveWallets(updated);
    showFeedback(t.walletDeleted);
  };

  // Submit Add / Edit Form
  const handleSubmitWalletForm = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAddress = formAddress.trim();
    if (!cleanAddress) {
      triggerHaptic('warning');
      alert(t.walletAddressLabel);
      return;
    }

    triggerHaptic('success');
    const cleanName = formName.trim() || `${formNetwork} Wallet`;

    if (walletViewMode === 'add') {
      const newWallet: WalletItem = {
        id: 'w_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
        name: cleanName,
        network: formNetwork,
        address: cleanAddress,
        memoOrTag: formMemo.trim() || undefined,
        isDefault: formIsDefault || wallets.length === 0,
        createdAt: Date.now(),
      };

      let updatedList: WalletItem[];
      if (newWallet.isDefault) {
        updatedList = [
          newWallet,
          ...wallets.map((w) => ({ ...w, isDefault: false })),
        ];
      } else {
        updatedList = [...wallets, newWallet];
      }

      onSaveWallets(updatedList);
      showFeedback(t.walletAddSuccess);
      setWalletViewMode('list');
    } else if (walletViewMode === 'edit' && editingWalletId) {
      const updatedList = wallets.map((w) => {
        if (w.id === editingWalletId) {
          return {
            ...w,
            name: cleanName,
            network: formNetwork,
            address: cleanAddress,
            memoOrTag: formMemo.trim() || undefined,
            isDefault: formIsDefault ? true : w.isDefault,
          };
        }
        return formIsDefault ? { ...w, isDefault: false } : w;
      });

      const hasDefault = updatedList.some((w) => w.isDefault);
      if (!hasDefault && updatedList.length > 0) {
        updatedList[0].isDefault = true;
      }

      onSaveWallets(updatedList);
      showFeedback(t.walletSavedSuccess);
      setWalletViewMode('list');
    }
  };

  // Save Desk Name
  const handleSaveDeskName = () => {
    triggerHaptic('light');
    onSaveMerchantName(deskName.trim() || 'VIP OTC Desk');
    showFeedback(t.deskNameSaved);
  };

  const getNetworkBadge = (net: WalletNetwork) => {
    const found = NETWORKS.find((n) => n.id === net) || NETWORKS[0];
    return (
      <span className={`px-2 py-0.5 text-[11px] font-bold rounded-md border ${found.badgeBg} ${found.badgeText}`}>
        {found.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150 select-none">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0 border border-blue-200/60 dark:border-blue-800/60">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {t.settingsTitle}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {t.settingsSub}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-close-settings-modal"
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl active:bg-slate-100 dark:active:bg-slate-800 touch-manipulation active:scale-95"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation (General vs USDT Wallets) */}
        <div className="px-5 pt-3 pb-2 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex bg-slate-200/80 dark:bg-slate-800 p-1 rounded-2xl gap-1">
            <button
              type="button"
              id="tab-settings-general"
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('general');
                setWalletViewMode('list');
              }}
              className={`flex-1 min-h-[40px] py-1.5 px-3 text-xs font-bold rounded-xl transition-all duration-100 flex items-center justify-center gap-1.5 touch-manipulation active:scale-[0.98] ${
                activeTab === 'general'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{t.tabGeneral}</span>
            </button>

            <button
              type="button"
              id="tab-settings-wallets"
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('wallets');
              }}
              className={`flex-1 min-h-[40px] py-1.5 px-3 text-xs font-bold rounded-xl transition-all duration-100 flex items-center justify-center gap-1.5 touch-manipulation active:scale-[0.98] ${
                activeTab === 'wallets'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{t.tabWallets} ({wallets.length})</span>
            </button>
          </div>
        </div>

        {/* Feedback Banner */}
        {feedbackMsg && (
          <div className="bg-blue-50 dark:bg-blue-950/80 px-4 py-2 text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center justify-between border-b border-blue-100 dark:border-blue-900 animate-in fade-in">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              {feedbackMsg}
            </span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {/* TAB 1: GENERAL (Language, Theme, Merchant Identity) */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              {/* Language Switcher Section */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {t.languageSectionTitle}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {t.languageSectionDesc}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3">
                  <button
                    type="button"
                    id="btn-lang-en"
                    onClick={() => {
                      triggerHaptic('medium');
                      onSelectLanguage('en');
                      showFeedback('Switched to English (EN)');
                    }}
                    className={`min-h-[46px] p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all touch-manipulation active:scale-[0.97] ${
                      language === 'en'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-base">🇺🇸</span>
                    <span>English (EN)</span>
                    {language === 'en' && <Check className="w-3.5 h-3.5 ml-1" />}
                  </button>

                  <button
                    type="button"
                    id="btn-lang-zh"
                    onClick={() => {
                      triggerHaptic('medium');
                      onSelectLanguage('zh');
                      showFeedback('已切换为中文 (CN)');
                    }}
                    className={`min-h-[46px] p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all touch-manipulation active:scale-[0.97] ${
                      language === 'zh'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-base">🇨🇳</span>
                    <span>中文 (CN)</span>
                    {language === 'zh' && <Check className="w-3.5 h-3.5 ml-1" />}
                  </button>
                </div>
              </div>

              {/* Appearance / Theme Switcher Section */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {t.themeSectionTitle}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {t.themeSectionDesc}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3">
                  <button
                    type="button"
                    id="btn-theme-light"
                    onClick={() => {
                      if (darkMode) {
                        triggerHaptic('medium');
                        onToggleDarkMode();
                        showFeedback('Switched to Light Mode');
                      }
                    }}
                    className={`min-h-[46px] p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all touch-manipulation active:scale-[0.97] ${
                      !darkMode
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span>{t.themeLight}</span>
                    {!darkMode && <Check className="w-3.5 h-3.5 ml-1" />}
                  </button>

                  <button
                    type="button"
                    id="btn-theme-dark"
                    onClick={() => {
                      if (!darkMode) {
                        triggerHaptic('medium');
                        onToggleDarkMode();
                        showFeedback('Switched to Dark Mode');
                      }
                    }}
                    className={`min-h-[46px] p-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all touch-manipulation active:scale-[0.97] ${
                      darkMode
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span>{t.themeDark}</span>
                    {darkMode && <Check className="w-3.5 h-3.5 ml-1" />}
                  </button>
                </div>
              </div>

              {/* Merchant Desk Title Setting */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {t.deskNameTitle}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {t.deskNameDesc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <input
                    type="text"
                    id="input-settings-desk-name"
                    value={deskName}
                    onChange={(e) => setDeskName(e.target.value)}
                    placeholder={t.deskNamePlaceholder}
                    className="flex-1 min-h-[42px] bg-white dark:bg-slate-900 px-3.5 py-2 text-xs text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <button
                    type="button"
                    id="btn-settings-save-desk"
                    onClick={handleSaveDeskName}
                    className="min-h-[42px] px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-xs transition-all touch-manipulation active:scale-95 shadow-xs"
                  >
                    {t.saveDeskName}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USDT WALLETS MANAGEMENT */}
          {activeTab === 'wallets' && (
            <div>
              {/* VIEW: WALLET LIST */}
              {walletViewMode === 'list' && (
                <div className="space-y-4">
                  {/* Top Bar: Add Wallet Button */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {t.walletListTitle} ({wallets.length})
                    </span>
                    <button
                      type="button"
                      id="btn-add-wallet-in-settings"
                      onClick={handleOpenAddForm}
                      className="min-h-[38px] px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 touch-manipulation active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t.addWalletBtn}</span>
                    </button>
                  </div>

                  {/* Wallets Cards List */}
                  <div className="space-y-2.5">
                    {wallets.map((wallet) => (
                      <div
                        key={wallet.id}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          wallet.isDefault
                            ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800 shadow-xs'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        {/* Top Row: Name, Network Badge, Default Indicator */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {getNetworkBadge(wallet.network)}
                            <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                              {wallet.name}
                            </span>
                            {wallet.isDefault && (
                              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-600 text-white rounded-md flex items-center gap-1 shadow-xs">
                                <Star className="w-2.5 h-2.5 fill-current" />
                                {t.defaultBadge}
                              </span>
                            )}
                          </div>

                          {/* Actions: Set Default, Edit, Delete */}
                          <div className="flex items-center gap-1 shrink-0">
                            {!wallet.isDefault && (
                              <button
                                type="button"
                                id={`btn-settings-set-default-${wallet.id}`}
                                onClick={() => handleSetDefault(wallet.id)}
                                className="min-h-[36px] px-2.5 py-1 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 rounded-xl transition-all touch-manipulation active:scale-95"
                                title={t.setDefaultBtn}
                              >
                                {t.setDefaultBtn}
                              </button>
                            )}
                            <button
                              type="button"
                              id={`btn-settings-edit-wallet-${wallet.id}`}
                              onClick={() => handleOpenEditForm(wallet)}
                              className="min-h-[36px] min-w-[36px] p-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 active:bg-slate-100 dark:active:bg-slate-700 rounded-xl transition-all flex items-center justify-center touch-manipulation active:scale-95"
                              title={t.editWalletBtn}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              id={`btn-settings-delete-wallet-${wallet.id}`}
                              onClick={() => handleDeleteWallet(wallet.id)}
                              disabled={wallets.length <= 1}
                              className="min-h-[36px] min-w-[36px] p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 active:bg-slate-100 dark:active:bg-slate-700 rounded-xl transition-all flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation active:scale-95"
                              title={t.deleteWalletBtn}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Address Box or Not Configured Warning */}
                        {wallet.address ? (
                          <div className="bg-slate-100 dark:bg-slate-900/90 px-3 py-2 rounded-xl flex items-center justify-between gap-2 border border-slate-200/60 dark:border-slate-700/60">
                            <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 truncate select-all">
                              {wallet.address}
                            </span>
                            <button
                              type="button"
                              id={`btn-settings-copy-addr-${wallet.id}`}
                              onClick={() => handleCopyAddress(wallet.id, wallet.address)}
                              className="min-h-[32px] min-w-[32px] p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white shrink-0 active:scale-90 transition-transform touch-manipulation flex items-center justify-center"
                              title={t.copyAddressBtn}
                            >
                              {copiedId === wallet.id ? (
                                <Check className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl flex items-center justify-between gap-2 border border-slate-300 dark:border-slate-700">
                            <span className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                              <span>{t.addressNotSetBadge}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenEditForm(wallet)}
                              className="min-h-[30px] px-2.5 py-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-[11px] rounded-lg transition-all touch-manipulation active:scale-95"
                            >
                              {t.editWalletBtn}
                            </button>
                          </div>
                        )}

                        {wallet.memoOrTag && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 pl-1">
                            Memo/Tag: {wallet.memoOrTag}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VIEW: ADD OR EDIT WALLET FORM */}
              {(walletViewMode === 'add' || walletViewMode === 'edit') && (
                <form onSubmit={handleSubmitWalletForm} className="space-y-4">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setWalletViewMode('list');
                      }}
                      className="min-h-[36px] px-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg flex items-center gap-1 font-bold text-xs"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>{t.cancelBtn}</span>
                    </button>
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {walletViewMode === 'add' ? t.addNewWalletTitle : t.editWalletTitle}
                    </span>
                  </div>

                  {/* Wallet Label */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.walletNameLabel} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      id="input-wallet-form-name"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder={t.walletNamePlaceholder}
                      className="w-full min-h-[44px] bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-xs text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  {/* Network Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.walletNetworkLabel} <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {NETWORKS.map((net) => (
                        <button
                          key={net.id}
                          type="button"
                          id={`btn-form-net-${net.id}`}
                          onClick={() => {
                            triggerHaptic('light');
                            setFormNetwork(net.id);
                          }}
                          className={`min-h-[44px] p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center touch-manipulation active:scale-95 ${
                            formNetwork === net.id
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-bold'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className="text-xs font-bold">{net.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* USDT Address */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.walletAddressLabel} ({formNetwork}) <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      id="input-wallet-form-address"
                      rows={3}
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      placeholder={
                        formNetwork === 'TRC20'
                          ? t.walletAddressPlaceholderTRC20
                          : formNetwork === 'Solana'
                          ? t.walletAddressPlaceholderSolana
                          : t.walletAddressPlaceholderEVM
                      }
                      className="w-full bg-slate-50 dark:bg-slate-800 p-3 text-xs font-mono text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none leading-relaxed"
                    />
                  </div>

                  {/* Memo / Tag */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {t.walletMemoLabel}
                    </label>
                    <input
                      type="text"
                      id="input-wallet-form-memo"
                      value={formMemo}
                      onChange={(e) => setFormMemo(e.target.value)}
                      placeholder={t.walletMemoPlaceholder}
                      className="w-full min-h-[44px] bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  {/* Set as default checkbox */}
                  <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer touch-manipulation min-h-[48px]">
                    <input
                      type="checkbox"
                      id="checkbox-settings-default"
                      checked={formIsDefault}
                      onChange={(e) => setFormIsDefault(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-600 border-slate-300 dark:border-slate-600"
                    />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white text-xs block">
                        {t.setAsDefaultCheckbox}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                        {t.setAsDefaultDesc}
                      </span>
                    </div>
                  </label>

                  {/* Form Action Buttons */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      id="btn-settings-cancel-form"
                      onClick={() => {
                        triggerHaptic('light');
                        setWalletViewMode('list');
                      }}
                      className="flex-1 min-h-[48px] py-2.5 px-4 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 active:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all touch-manipulation active:scale-[0.97]"
                    >
                      {t.cancelBtn}
                    </button>
                    <button
                      type="submit"
                      id="btn-settings-submit-wallet"
                      className="flex-1 min-h-[48px] py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 touch-manipulation active:scale-[0.97]"
                    >
                      <Check className="w-4 h-4" />
                      <span>{t.saveWalletBtn}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
