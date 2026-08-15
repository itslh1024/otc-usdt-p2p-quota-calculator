import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CalculationInputs, CalculationMode, CurrencyInfo, RateData, TradeRecord, WalletItem } from './types';
import { Language, translations } from './locales/translations';
import { SUPPORTED_CURRENCIES, DEFAULT_WALLETS } from './constants/currencies';
import { fetchLiveExchangeRates } from './services/rateService';
import { calculateOTCQuote, formatNumber } from './utils/calculator';
import { Header } from './components/Header';
import { ConverterCard } from './components/ConverterCard';
import { CalculationBreakdown } from './components/CalculationBreakdown';
import { BottomActionBar } from './components/BottomActionBar';
import { QuickAdjustBottomSheet } from './components/QuickAdjustBottomSheet';
import { QuickQuoteModal } from './components/QuickQuoteModal';
import { TradeHistoryModal } from './components/TradeHistoryModal';
import { SettingsModal } from './components/SettingsModal';
import { SetupWalletModal } from './components/SetupWalletModal';
import { CheckCircle2, Shield } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const STORAGE_KEYS = {
  LANGUAGE: 'otc_language_v1',
  WALLETS: 'otc_wallets_v2',
  MERCHANT: 'otc_merchant_name_v1',
  HISTORY: 'otc_trade_history_v1',
  SETTINGS: 'otc_fee_settings_v2',
  THEME: 'otc_dark_mode_v1',
};

export default function App() {
  // Language state (default 'en' as requested, supports 'zh' switch)
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
      if (saved === 'zh' || saved === 'en') return saved;
      return 'en';
    } catch {
      return 'en';
    }
  });

  const t = translations[language];

  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved !== null) return JSON.parse(saved);
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Rates state
  const [rates, setRates] = useState<Record<string, RateData>>({});
  const [isLoadingRate, setIsLoadingRate] = useState<boolean>(false);

  // Calculation parameters state
  const [mode, setMode] = useState<CalculationMode>('RMB_TO_USDT');
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyInfo>(SUPPORTED_CURRENCIES[0]); // CNY/RMB default
  const [inputAmount, setInputAmount] = useState<number>(0); // Default empty
  const [walletFeeUSDT, setWalletFeeUSDT] = useState<number>(1.5); // 1.5 USDT per order default
  const [conversionFeePercent, setConversionFeePercent] = useState<number>(3.0); // 3.0% default (range 2%-4%)
  const [profitMarginPercent, setProfitMarginPercent] = useState<number>(15.0); // 15.0% default custom profit margin
  const [customRateOverride, setCustomRateOverride] = useState<number | null>(null);

  // Hero Mode state: true expands custom numpad and collapses secondary controls for full immersion
  const [isHeroMode, setIsHeroMode] = useState<boolean>(true);

  // Modals state
  const [isQuickAdjustOpen, setIsQuickAdjustOpen] = useState<boolean>(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState<boolean>(false);
  const [isSetupWalletModalOpen, setIsSetupWalletModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<'general' | 'wallets'>('general');

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string>(null as unknown as string);
  const [copiedQuota, setCopiedQuota] = useState<boolean>(false);

  // Wallets state
  const [wallets, setWallets] = useState<WalletItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WALLETS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const dummyAddresses = [
            'TYDzsYUE22jVqP32YgM9x1qYVfH4bN7QjK',
            '0x71C8360f3794697F49e7b41e3d36b856C717d23F',
          ];
          return parsed.map((w: WalletItem) => ({
            ...w,
            address: dummyAddresses.includes(w.address) ? '' : (w.address || ''),
          }));
        }
      }
      return DEFAULT_WALLETS;
    } catch {
      return DEFAULT_WALLETS;
    }
  });

  // Merchant Desk Name
  const [merchantName, setMerchantName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MERCHANT);
      return saved || 'VIP OTC Desk';
    } catch {
      return 'VIP OTC Desk';
    }
  });

  // Trade history state
  const [trades, setTrades] = useState<TradeRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save language to storage when changed
  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    } catch (e) {
      console.warn('Failed to save language', e);
    }
  };

  // Load fee settings from storage on startup
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.walletFeeUSDT !== undefined) setWalletFeeUSDT(parsed.walletFeeUSDT);
        if (parsed.conversionFeePercent !== undefined) setConversionFeePercent(parsed.conversionFeePercent);
        if (parsed.profitMarginPercent !== undefined) setProfitMarginPercent(parsed.profitMarginPercent);
      }
    } catch (e) {
      console.warn('Failed to load settings', e);
    }
  }, []);

  // Save settings when changed
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify({
          walletFeeUSDT,
          conversionFeePercent,
          profitMarginPercent,
        })
      );
    } catch (e) {
      console.warn('Failed to save settings', e);
    }
  }, [walletFeeUSDT, conversionFeePercent, profitMarginPercent]);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(darkMode));
  }, [darkMode]);

  // Fetch rates
  const loadRates = useCallback(async () => {
    setIsLoadingRate(true);
    try {
      const fetched = await fetchLiveExchangeRates();
      setRates(fetched);
    } catch (err) {
      console.error('Error fetching rates:', err);
    } finally {
      setIsLoadingRate(false);
    }
  }, []);

  useEffect(() => {
    loadRates();
    const interval = setInterval(loadRates, 45000);
    return () => clearInterval(interval);
  }, [loadRates]);

  // Trigger brief toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null as unknown as string);
    }, 2400);
  };

  // Perform Calculation
  const currentRateData = rates[selectedCurrency.code];
  const marketRate = currentRateData?.rate || selectedCurrency.defaultRateToUSD;

  const calculationInputs: CalculationInputs = useMemo(() => ({
    mode,
    targetCurrency: selectedCurrency.code,
    inputAmount,
    walletFeeUSDT,
    conversionFeePercent,
    profitMarginPercent,
    customRateOverride,
  }), [
    mode,
    selectedCurrency.code,
    inputAmount,
    walletFeeUSDT,
    conversionFeePercent,
    profitMarginPercent,
    customRateOverride,
  ]);

  const calculationResult = useMemo(() => {
    return calculateOTCQuote(calculationInputs, marketRate);
  }, [calculationInputs, marketRate]);

  // Mode toggle handler
  const handleToggleMode = () => {
    if (mode === 'RMB_TO_USDT') {
      setMode('USDT_TO_RMB');
      setInputAmount(Math.round(calculationResult.grossUSDT || 1000));
    } else {
      setMode('RMB_TO_USDT');
      setInputAmount(Math.round(calculationResult.netLocalAmount || 10000));
    }
  };

  // Copy calculated quota to clipboard
  const handleCopyQuota = async () => {
    const isRmb = mode === 'RMB_TO_USDT';
    const textToCopy = isRmb
      ? `${formatNumber(calculationResult.grossUSDT, 2)} USDT`
      : `${selectedCurrency.symbol}${formatNumber(calculationResult.netLocalAmount, selectedCurrency.decimals)} ${selectedCurrency.code}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedQuota(true);
      showToast(`${t.btnCopyQuota}: ${textToCopy}`);
      setTimeout(() => setCopiedQuota(false), 2000);
    } catch {
      showToast(t.quotaCopied);
    }
  };

  // Save Trade handler
  const handleSaveTrade = () => {
    const newTrade: TradeRecord = {
      id: 'tx_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
      timestamp: Date.now(),
      mode,
      currencyCode: selectedCurrency.code,
      grossUSDT: calculationResult.grossUSDT,
      netLocalAmount: calculationResult.netLocalAmount,
      profitUSDT: calculationResult.profitUSDT,
      profitLocal: calculationResult.profitLocal,
      marketRate: calculationResult.marketRate,
      effectiveRate: calculationResult.effectiveRate,
      conversionFeePercent: calculationResult.conversionFeePercent,
      profitMarginPercent: calculationResult.profitMarginPercent,
      walletFeeUSDT: calculationResult.walletFeeUSDT,
    };

    const updated = [newTrade, ...trades];
    setTrades(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to store history', e);
    }
    showToast(t.tradeSavedToast);
  };

  // Delete single trade
  const handleDeleteTrade = (id: string) => {
    const updated = trades.filter((tr) => tr.id !== id);
    setTrades(updated);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  };

  // Clear all trades
  const handleClearHistory = () => {
    setTrades([]);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    showToast(t.historyCleared);
  };

  // Save Wallets
  const handleSaveWallets = (newWallets: WalletItem[]) => {
    setWallets(newWallets);
    try {
      localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(newWallets));
    } catch (e) {
      console.warn('Failed to save wallets', e);
    }
    showToast(t.walletSavedSuccess);
  };

  // Save Merchant Name
  const handleSaveMerchantName = (name: string) => {
    setMerchantName(name);
    try {
      localStorage.setItem(STORAGE_KEYS.MERCHANT, name);
    } catch (e) {
      console.warn('Failed to save merchant name', e);
    }
    showToast(t.deskNameSaved);
  };

  const handleOpenSettings = (initialTab: 'general' | 'wallets' = 'general') => {
    setSettingsInitialTab(initialTab);
    setIsSettingsModalOpen(true);
  };

  // Initiate Payment / Payment Slip Generation
  const handleInitiatePayment = () => {
    const defaultWallet = wallets.find((w) => w.isDefault) || wallets[0];
    const hasConfiguredAddress = Boolean(
      (defaultWallet && defaultWallet.address && defaultWallet.address.trim()) ||
      wallets.some((w) => w.address && w.address.trim())
    );

    if (!hasConfiguredAddress) {
      setIsSetupWalletModalOpen(true);
    } else {
      setIsQuoteModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors flex flex-col antialiased">
      {/* Top Header */}
      <Header
        language={language}
        currentCurrency={selectedCurrency}
        rateData={currentRateData}
        isLoadingRate={isLoadingRate}
        onRefreshRate={loadRates}
        onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        hasCustomOverride={customRateOverride !== null && customRateOverride > 0}
        historyCount={trades.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-5 pb-24">
        {/* Converter Card with Hero Input & Custom Numpad */}
        <ConverterCard
          language={language}
          mode={mode}
          onToggleMode={handleToggleMode}
          inputAmount={inputAmount}
          onChangeInputAmount={setInputAmount}
          targetCurrency={selectedCurrency}
          onSelectCurrency={setSelectedCurrency}
          result={calculationResult}
          onOpenQuoteModal={handleInitiatePayment}
          onSaveTrade={handleSaveTrade}
          copiedQuota={copiedQuota}
          onCopyQuota={handleCopyQuota}
          isHeroMode={isHeroMode}
          onToggleHeroMode={setIsHeroMode}
        />

        {/* Secondary Panels (Smoothly animated) */}
        <AnimatePresence initial={false}>
          {!isHeroMode && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Transparent Calculation Waterfall & Audit */}
              <CalculationBreakdown result={calculationResult} language={language} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Quick Info */}
        <div className="py-4 text-center text-xs text-slate-400 dark:text-slate-500 space-y-1">
          <p className="flex items-center justify-center gap-1">
            <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{t.footerFormulas}</span>
          </p>
          <p className="text-[11px]">
            {t.footerTagline}
          </p>
        </div>
      </main>

      {/* Persistent Bottom Action Bar */}
      <BottomActionBar
        language={language}
        onOpenQuickAdjust={() => setIsQuickAdjustOpen(true)}
        onOpenSettings={handleOpenSettings}
        walletsCount={wallets.length}
        walletFeeUSDT={walletFeeUSDT}
        conversionFeePercent={conversionFeePercent}
        profitMarginPercent={profitMarginPercent}
      />

      {/* Bottom Sheet for Quick Fee & Rate Adjustment */}
      <QuickAdjustBottomSheet
        isOpen={isQuickAdjustOpen}
        onClose={() => setIsQuickAdjustOpen(false)}
        language={language}
        walletFeeUSDT={walletFeeUSDT}
        onChangeWalletFee={setWalletFeeUSDT}
        conversionFeePercent={conversionFeePercent}
        onChangeConversionFee={setConversionFeePercent}
        profitMarginPercent={profitMarginPercent}
        onChangeProfitMargin={setProfitMarginPercent}
        customRateOverride={customRateOverride}
        onChangeCustomRateOverride={setCustomRateOverride}
        marketRate={marketRate}
        currentCurrency={selectedCurrency}
      />

      {/* Modals */}
      <SetupWalletModal
        isOpen={isSetupWalletModalOpen}
        onClose={() => setIsSetupWalletModalOpen(false)}
        language={language}
        wallets={wallets}
        onSaveWallets={handleSaveWallets}
        onProceedToQuote={() => {
          setIsSetupWalletModalOpen(false);
          setIsQuoteModalOpen(true);
        }}
        onSkipToQuote={() => {
          setIsSetupWalletModalOpen(false);
          setIsQuoteModalOpen(true);
        }}
      />

      <QuickQuoteModal
        language={language}
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        result={calculationResult}
        wallets={wallets}
        merchantName={merchantName}
        onSaveTrade={handleSaveTrade}
        onSaveWallets={handleSaveWallets}
        onOpenWalletSettings={() => {
          setIsQuoteModalOpen(false);
          handleOpenSettings('wallets');
        }}
      />

      <TradeHistoryModal
        language={language}
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        trades={trades}
        onClearHistory={handleClearHistory}
        onDeleteTrade={handleDeleteTrade}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        language={language}
        onSelectLanguage={handleSelectLanguage}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        wallets={wallets}
        merchantName={merchantName}
        onSaveWallets={handleSaveWallets}
        onSaveMerchantName={handleSaveMerchantName}
        initialTab={settingsInitialTab}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
