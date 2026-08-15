export type CalculationMode = 'RMB_TO_USDT' | 'USDT_TO_RMB';

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  defaultRateToUSD: number; // 1 USDT = X local currency
  decimals: number;
}

export interface RateData {
  currencyCode: string;
  rate: number; // 1 USDT = X Currency
  lastUpdated: string;
  source: 'live_binance' | 'live_coingecko' | 'live_forex' | 'fallback' | 'custom_override';
  isLive: boolean;
}

export interface CalculationInputs {
  mode: CalculationMode;
  targetCurrency: string; // default 'CNY'
  inputAmount: number; // Either Target Local Currency or Gross USDT depending on mode
  walletFeeUSDT: number; // default 1.5 USDT
  conversionFeePercent: number; // 2.0% - 4.0% default e.g. 2.5%
  profitMarginPercent: number; // e.g. 1.5%
  customRateOverride?: number | null; // if merchant sets a custom floor rate
}

export interface CalculationResult {
  mode: CalculationMode;
  targetCurrency: CurrencyInfo;
  
  // Amounts
  grossUSDT: number;
  walletFeeUSDT: number;
  netUSDTAfterWalletFee: number;
  
  // Rates
  marketRate: number; // Base market rate (1 USDT = X Local)
  effectiveRate: number; // Client's effective rate (Local / Gross USDT)
  
  // Local Currency Breakdown
  grossLocalBeforeFees: number;
  conversionFeeLocal: number;
  conversionFeePercent: number;
  
  profitMarginPercent: number;
  profitLocal: number;
  profitUSDT: number;
  
  // Final Net delivered / required
  netLocalAmount: number;
  
  // Step-by-step explanation
  steps: {
    title: string;
    description: string;
    amount: string;
    isDeduction?: boolean;
    isHighlight?: boolean;
  }[];
}

export interface TradeRecord {
  id: string;
  timestamp: number;
  clientName?: string;
  note?: string;
  mode: CalculationMode;
  currencyCode: string;
  grossUSDT: number;
  netLocalAmount: number;
  profitUSDT: number;
  profitLocal: number;
  marketRate: number;
  effectiveRate: number;
  conversionFeePercent: number;
  profitMarginPercent: number;
  walletFeeUSDT: number;
}

export type WalletNetwork = 'TRC20' | 'ERC20' | 'BEP20' | 'Polygon' | 'Solana' | 'Arbitrum';

export interface WalletItem {
  id: string;
  name: string;
  network: WalletNetwork;
  address: string;
  memoOrTag?: string;
  isDefault: boolean;
  createdAt: number;
}

export interface WalletConfig {
  network: WalletNetwork;
  address: string;
  memoOrTag?: string;
  merchantName?: string;
}
