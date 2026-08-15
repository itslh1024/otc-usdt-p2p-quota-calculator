import { CalculationInputs, CalculationResult, CurrencyInfo } from '../types';
import { SUPPORTED_CURRENCIES } from '../constants/currencies';

export function calculateOTCQuote(
  inputs: CalculationInputs,
  marketRate: number
): CalculationResult {
  const {
    mode,
    targetCurrency: currCode,
    inputAmount,
    walletFeeUSDT,
    conversionFeePercent,
    profitMarginPercent,
  } = inputs;

  const targetCurrency: CurrencyInfo =
    SUPPORTED_CURRENCIES.find((c) => c.code === currCode) || SUPPORTED_CURRENCIES[0];

  const rate = inputs.customRateOverride && inputs.customRateOverride > 0
    ? inputs.customRateOverride
    : marketRate > 0
    ? marketRate
    : targetCurrency.defaultRateToUSD;

  const cFraction = Math.min(0.99, Math.max(0, conversionFeePercent) / 100);
  const mFraction = Math.max(0, profitMarginPercent) / 100;

  let grossUSDT = 0;
  let netUSDTAfterWalletFee = 0;
  let grossLocalBeforeFees = 0;
  let conversionFeeLocal = 0;
  let profitLocal = 0;
  let profitUSDT = 0;
  let netLocalAmount = 0;
  let effectiveRate = 0;

  if (mode === 'RMB_TO_USDT') {
    // inputAmount is the known cost of goods/services in local fiat
    netLocalAmount = Math.max(0, inputAmount);
    profitLocal = netLocalAmount * mFraction;
    const netLocalRequired = netLocalAmount + profitLocal; // Cost + Profit

    if (1 - cFraction > 0 && rate > 0 && netLocalAmount > 0) {
      grossLocalBeforeFees = netLocalRequired / (1 - cFraction);
      conversionFeeLocal = grossLocalBeforeFees - netLocalRequired;
      netUSDTAfterWalletFee = grossLocalBeforeFees / rate;
      grossUSDT = netUSDTAfterWalletFee + walletFeeUSDT;
      profitUSDT = profitLocal / rate;
    } else {
      grossUSDT = 0;
      netUSDTAfterWalletFee = 0;
      grossLocalBeforeFees = 0;
      conversionFeeLocal = 0;
      profitLocal = 0;
      profitUSDT = 0;
    }
  } else {
    // Client transfers gross USDT amount
    grossUSDT = Math.max(0, inputAmount);
    netUSDTAfterWalletFee = Math.max(0, grossUSDT - walletFeeUSDT);

    if (netUSDTAfterWalletFee > 0 && rate > 0) {
      grossLocalBeforeFees = netUSDTAfterWalletFee * rate;
      conversionFeeLocal = grossLocalBeforeFees * cFraction;
      const netLocalRequired = grossLocalBeforeFees - conversionFeeLocal;
      netLocalAmount = netLocalRequired / (1 + mFraction); // Reverse cost = netLocalRequired / (1 + markup)
      profitLocal = netLocalRequired - netLocalAmount;
      profitUSDT = profitLocal / rate;
    } else {
      grossLocalBeforeFees = 0;
      conversionFeeLocal = 0;
      profitLocal = 0;
      profitUSDT = 0;
      netLocalAmount = 0;
    }
  }

  effectiveRate = grossUSDT > 0 ? netLocalAmount / grossUSDT : 0;

  // Build step-by-step audit
  const steps = [
    {
      title: 'Total USDT Payable (应收货款总额)',
      description: 'Total USDT amount client transfers for goods/services',
      amount: `${formatNumber(grossUSDT, 2)} USDT`,
      isHighlight: true,
    },
    {
      title: 'USDT Wallet Network / Withdrawal Fee',
      description: 'Transfer cost from wallet to exchange market',
      amount: `-${formatNumber(walletFeeUSDT, 2)} USDT`,
      isDeduction: true,
    },
    {
      title: 'Net USDT for Market Exchange',
      description: 'USDT converted into local currency',
      amount: `${formatNumber(netUSDTAfterWalletFee, 2)} USDT`,
    },
    {
      title: `Market Conversion (1 USDT = ${formatNumber(rate, 4)} ${targetCurrency.code})`,
      description: 'Gross fiat value at spot market rate',
      amount: `${targetCurrency.symbol}${formatNumber(grossLocalBeforeFees, targetCurrency.decimals)}`,
    },
    {
      title: `Market Conversion Fee (${conversionFeePercent.toFixed(1)}%)`,
      description: 'Exchange transaction / spread fee (applied on gross fiat)',
      amount: `-${targetCurrency.symbol}${formatNumber(conversionFeeLocal, targetCurrency.decimals)}`,
      isDeduction: true,
    },
    {
      title: `Merchant Profit Markup (+${profitMarginPercent.toFixed(1)}% on Cost)`,
      description: `Profit markup on known cost (~${formatNumber(profitUSDT, 2)} USDT)`,
      amount: `+${targetCurrency.symbol}${formatNumber(profitLocal, targetCurrency.decimals)}`,
      isHighlight: true,
    },
    {
      title: 'Known Product/Service Cost (已知成本底金)',
      description: `Known ${targetCurrency.name} base cost of goods/services`,
      amount: `${targetCurrency.symbol}${formatNumber(netLocalAmount, targetCurrency.decimals)}`,
      isHighlight: true,
    },
  ];

  return {
    mode,
    targetCurrency,
    grossUSDT,
    walletFeeUSDT,
    netUSDTAfterWalletFee,
    marketRate: rate,
    effectiveRate,
    grossLocalBeforeFees,
    conversionFeeLocal,
    conversionFeePercent,
    profitMarginPercent,
    profitLocal,
    profitUSDT,
    netLocalAmount,
    steps,
  };
}

export function formatNumber(num: number, decimals: number = 2): string {
  if (isNaN(num) || !isFinite(num)) return '0.00';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function generateQuoteText(
  result: CalculationResult,
  walletAddress?: string,
  walletNetwork: string = 'TRC20',
  language: 'zh' | 'en' = 'zh',
  includeCostBreakdown: boolean = true
): string {
  const { targetCurrency, grossUSDT, netLocalAmount, effectiveRate } = result;
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (language === 'zh') {
    return [
      `⚡【OTC 货款结算报价单】⚡`,
      `⏰ 报价时间: ${now} (有效期 15 分钟)`,
      `----------------------------`,
      `💰 应付货款: ${formatNumber(grossUSDT, 2)} USDT (${walletNetwork})`,
      includeCostBreakdown ? `📦 商品/服务成本: ${targetCurrency.symbol}${formatNumber(netLocalAmount, targetCurrency.decimals)} ${targetCurrency.code}` : '',
      includeCostBreakdown ? `📊 综合折算率: 1 USDT ≈ ${formatNumber(effectiveRate, 4)} ${targetCurrency.code}` : '',
      walletAddress ? `----------------------------\n📥 收款地址 (${walletNetwork}):\n${walletAddress}` : '',
      `⚠️ 请务必核对网络类型并预留矿工费，转账后请发送交易截图。`,
    ].filter(Boolean).join('\n');
  }

  return [
    `⚡ [OTC Payment & Settlement Quote] ⚡`,
    `⏰ Time: ${now} (Valid for 15 mins)`,
    `----------------------------`,
    `💰 Payable Amount: ${formatNumber(grossUSDT, 2)} USDT (${walletNetwork})`,
    includeCostBreakdown ? `📦 Product/Service Cost: ${targetCurrency.symbol}${formatNumber(netLocalAmount, targetCurrency.decimals)} ${targetCurrency.code}` : '',
    includeCostBreakdown ? `📊 Effective Rate: 1 USDT ≈ ${formatNumber(effectiveRate, 4)} ${targetCurrency.code}` : '',
    walletAddress ? `----------------------------\n📥 Wallet Address (${walletNetwork}):\n${walletAddress}` : '',
    `⚠️ Please confirm the network type. Send transaction screenshot upon transfer.`,
  ].filter(Boolean).join('\n');
}
