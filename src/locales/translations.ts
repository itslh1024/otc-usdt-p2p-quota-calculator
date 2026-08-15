export type Language = 'en' | 'zh';

export interface Translations {
  // App & Header
  appTitle: string;
  p2pDeskBadge: string;
  costBaseSub: string;
  feeSub: string;
  marketRate: string;
  refreshRate: string;
  refreshing: string;
  rateLive: string;
  rateCustom: string;
  tradeHistoryBtn: string;
  settingsBtn: string;

  // Settings Modal
  settingsTitle: string;
  settingsSub: string;
  tabGeneral: string;
  tabWallets: string;
  languageSectionTitle: string;
  languageSectionDesc: string;
  langEn: string;
  langZh: string;
  themeSectionTitle: string;
  themeSectionDesc: string;
  themeLight: string;
  themeDark: string;
  deskNameTitle: string;
  deskNameDesc: string;
  deskNamePlaceholder: string;
  saveDeskName: string;
  deskNameSaved: string;

  // Wallet Management inside Settings
  walletListTitle: string;
  walletCount: string;
  addWalletBtn: string;
  defaultBadge: string;
  setDefaultBtn: string;
  editWalletBtn: string;
  deleteWalletBtn: string;
  copyAddressBtn: string;
  addressCopied: string;
  atLeastOneWallet: string;
  walletDeleted: string;
  defaultWalletSet: string;
  addNewWalletTitle: string;
  editWalletTitle: string;
  walletNameLabel: string;
  walletNamePlaceholder: string;
  walletNetworkLabel: string;
  walletAddressLabel: string;
  walletAddressPlaceholderTRC20: string;
  walletAddressPlaceholderSolana: string;
  walletAddressPlaceholderEVM: string;
  walletMemoLabel: string;
  walletMemoPlaceholder: string;
  setAsDefaultCheckbox: string;
  setAsDefaultDesc: string;
  cancelBtn: string;
  saveWalletBtn: string;
  walletSavedSuccess: string;
  walletAddSuccess: string;
  defaultWalletHint: string;

  // Converter Card
  modeCostToUSDT: string;
  modeUSDTToCost: string;
  costInputLabel: string;
  usdtInputLabel: string;
  clearInputBtn: string;
  costPresetsLabel: string;
  usdtPresetsLabel: string;
  quickTapHint: string;
  finalUsdtTitle: string;
  coveredCostTitle: string;
  effectiveRateLabel: string;
  btnGenerateSlip: string;
  btnSaveRecord: string;
  btnCopyQuota: string;
  quotaCopied: string;

  // Fee & Margin Settings
  feeSettingsTitle: string;
  transferFeeShort: string;
  convFeeShort: string;
  profitShort: string;
  collapse: string;
  expand: string;
  walletFeeLabel: string;
  walletFeeStd: string;
  convFeeLabel: string;
  convFeeSub: string;
  profitMarginLabel: string;
  profitMarginSub: string;
  customRateActive: string;
  useMarketRate: string;
  marketSpotRate: string;

  // Waterfall Breakdown
  breakdownTitle: string;
  effectiveRateShort: string;
  netProfitShort: string;
  hideSteps: string;
  viewDetails: string;
  marketBaseRate: string;
  clientEffectiveRate: string;
  spreadImpact: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  step4Title: string;
  step4Desc: string;
  step5Title: string;
  step5Desc: string;
  step6Title: string;
  step6Desc: string;
  step7Title: string;
  step7Desc: string;

  // Quick Quote / Payment Slip Modal
  slipModalTitle: string;
  slipModalSub: string;
  totalUsdtPayable: string;
  costCoverageLabel: string;
  rateLabel: string;
  selectWalletNetwork: string;
  scanToPay: string;
  addressLabel: string;
  copyAddrBtn: string;
  copiedAddrBtn: string;
  formattedTextTitle: string;
  copyTextSlip: string;
  textSlipCopied: string;
  saveTradeRecord: string;
  tradeRecorded: string;
  walletConfigBtn: string;
  noAddressConfigured: string;
  noAddressHint: string;
  btnConfigureWallet: string;
  addressNotSetBadge: string;
  quickSetAddressTitle: string;
  quickSetAddressDesc: string;
  pasteFromClipboard: string;
  saveAndApply: string;

  // First-Time Setup Wallet Modal
  firstTimeSetupTitle: string;
  firstTimeSetupSub: string;
  firstTimeSetupDesc: string;
  firstTimeSetupBtn: string;
  skipSetupBtn: string;
  networkSelectLabel: string;
  inputAddressPlaceholder: string;

  // Trade History Modal
  historyModalTitle: string;
  historyCountSub: string;
  totalVolume: string;
  totalProfitUsdt: string;
  totalProfitFiat: string;
  searchPlaceholder: string;
  emptyHistory: string;
  emptyHistorySub: string;
  exportCsvBtn: string;
  clearHistoryBtn: string;
  confirmClearHistory: string;
  historyCleared: string;
  deleteSingleTrade: string;
  grossUsdtShort: string;
  costShort: string;

  // Footer & Common
  footerFormulas: string;
  footerTagline: string;
  tradeSavedToast: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // App & Header
    appTitle: 'OTC Quota',
    p2pDeskBadge: 'P2P Desk',
    costBaseSub: 'Cost Base',
    feeSub: '1.5₮/tx fee',
    marketRate: 'Market',
    refreshRate: 'Refresh Rate',
    refreshing: 'Updating...',
    rateLive: 'Live',
    rateCustom: 'Custom Rate',
    tradeHistoryBtn: 'Trade History',
    settingsBtn: 'Settings',

    // Settings Modal
    settingsTitle: 'Settings & Preferences',
    settingsSub: 'Configure language, appearance, wallets, and OTC desk identity',
    tabGeneral: 'General',
    tabWallets: 'USDT Wallets',
    languageSectionTitle: 'Language (语言)',
    languageSectionDesc: 'Switch interface language',
    langEn: 'English (EN)',
    langZh: '中文 (CN)',
    themeSectionTitle: 'Appearance / Theme',
    themeSectionDesc: 'Switch between light and dark mode for eye comfort',
    themeLight: 'Light Mode',
    themeDark: 'Dark Mode',
    deskNameTitle: 'OTC Merchant / Desk Name',
    deskNameDesc: 'Appears on customer payment slips and shared quotes',
    deskNamePlaceholder: 'e.g. VIP OTC Desk, Apex Settlement...',
    saveDeskName: 'Save Desk Name',
    deskNameSaved: 'Desk name saved',

    // Wallet Management inside Settings
    walletListTitle: 'Configured USDT Wallets',
    walletCount: 'Wallets',
    addWalletBtn: 'Add Wallet',
    defaultBadge: 'Default',
    setDefaultBtn: 'Set Default',
    editWalletBtn: 'Edit',
    deleteWalletBtn: 'Delete',
    copyAddressBtn: 'Copy Address',
    addressCopied: 'Copied!',
    atLeastOneWallet: 'Please keep at least one wallet address.',
    walletDeleted: 'Wallet deleted',
    defaultWalletSet: 'Default wallet updated',
    addNewWalletTitle: 'Add New USDT Wallet',
    editWalletTitle: 'Edit USDT Wallet',
    walletNameLabel: 'Wallet Label / Name',
    walletNamePlaceholder: 'e.g. Main TRC20, Binance Deposit, Cold Wallet...',
    walletNetworkLabel: 'Network Protocol',
    walletAddressLabel: 'USDT Deposit Address',
    walletAddressPlaceholderTRC20: 'Enter Tron TRC20 address (Starts with T, 34 characters)',
    walletAddressPlaceholderSolana: 'Enter Solana address (Base58, 32-44 characters)',
    walletAddressPlaceholderEVM: 'Enter EVM address (Starts with 0x, 42 characters)',
    walletMemoLabel: 'Memo / Tag (Optional)',
    walletMemoPlaceholder: 'Leave blank if not required by exchange',
    setAsDefaultCheckbox: 'Set as Default Wallet',
    setAsDefaultDesc: 'Used by default for payment slips and QR deposit codes',
    cancelBtn: 'Cancel',
    saveWalletBtn: 'Save Wallet',
    walletSavedSuccess: 'Wallet saved successfully!',
    walletAddSuccess: 'New wallet added!',
    defaultWalletHint: 'Payment slips and deposit QR codes automatically use the default wallet. You can still switch networks anytime.',

    // Converter Card
    modeCostToUSDT: 'Cost → USDT Payment',
    modeUSDTToCost: 'USDT Payment → Cost Coverage',
    costInputLabel: 'Product / Service Cost',
    usdtInputLabel: 'Client Payment Amount (USDT)',
    clearInputBtn: 'CLEAR',
    costPresetsLabel: 'Common Cost Presets',
    usdtPresetsLabel: 'Common USDT Presets',
    quickTapHint: 'Instant preset load',
    finalUsdtTitle: 'Final USDT Payment',
    coveredCostTitle: 'Product / Service Cost Covered',
    effectiveRateLabel: 'Effective Rate',
    btnGenerateSlip: 'Payment Slip / QR',
    btnSaveRecord: 'Save Record',
    btnCopyQuota: 'Copy Quota',
    quotaCopied: 'Copied to clipboard!',

    // Fee & Margin Settings
    feeSettingsTitle: 'Fee & Profit Margin Parameters',
    transferFeeShort: 'Fee',
    convFeeShort: 'Conv',
    profitShort: 'Profit',
    collapse: 'Collapse',
    expand: 'Configure',
    walletFeeLabel: 'Wallet Network Transfer Fee (USDT)',
    walletFeeStd: '1.5 ₮ (Std)',
    convFeeLabel: 'Market Conversion & Spread Fee (2% - 4%)',
    convFeeSub: 'Local fiat OTC cashing and conversion overhead',
    profitMarginLabel: 'Custom Merchant Profit Markup',
    profitMarginSub: 'Net profit markup calculated on known cost base',
    customRateActive: 'Fixed Custom Rate Active',
    useMarketRate: 'Use Live Market Rate',
    marketSpotRate: 'Spot Market Rate',

    // Waterfall Breakdown
    breakdownTitle: 'Transparent Quota Waterfall Breakdown',
    effectiveRateShort: 'Effective',
    netProfitShort: 'Net Profit',
    hideSteps: 'Hide Steps',
    viewDetails: 'View Details',
    marketBaseRate: 'Spot Market Base Rate',
    clientEffectiveRate: 'Client Effective Quoted Rate',
    spreadImpact: 'Spread Impact',
    step1Title: 'Gross Client Payment (USDT)',
    step1Desc: 'Total USDT amount client wallet transfers',
    step2Title: 'Wallet Network Transfer Fee',
    step2Desc: 'Single on-chain / gateway deduction',
    step3Title: 'Net USDT for Market Exchange',
    step3Desc: 'USDT principal converted into local currency',
    step4Title: 'Spot Market Fiat Equivalent',
    step4Desc: 'Evaluated at spot market rate',
    step5Title: 'Market Conversion Fee',
    step5Desc: 'Local cashing loss and spread overhead',
    step6Title: 'Merchant Profit Markup (Cost Markup)',
    step6Desc: 'Profit markup calculated directly on known cost base',
    step7Title: 'Known Product / Service Cost (Cost Base)',
    step7Desc: 'Base cost of goods or services to be covered',

    // Quick Quote / Payment Slip Modal
    slipModalTitle: 'Payment & Settlement Slip',
    slipModalSub: 'Shareable OTC Quote & Deposit QR Code',
    totalUsdtPayable: 'Total USDT Payable (应付货款总额)',
    costCoverageLabel: 'Cost Coverage',
    rateLabel: 'Rate',
    selectWalletNetwork: 'Select Wallet Network / Protocol',
    scanToPay: 'Scan QR to Transfer USDT',
    addressLabel: 'Deposit Address',
    copyAddrBtn: 'Copy Address',
    copiedAddrBtn: 'Address Copied!',
    formattedTextTitle: 'Shareable Text Slip (WhatsApp / Telegram / WeChat)',
    copyTextSlip: 'Copy Text Slip',
    textSlipCopied: 'Text Slip Copied!',
    saveTradeRecord: 'Save to Trade Log',
    tradeRecorded: 'Trade Recorded!',
    walletConfigBtn: 'Manage Wallets',
    noAddressConfigured: 'No Deposit Address Configured',
    noAddressHint: 'Please configure at least one USDT wallet address to generate deposit QR codes and payment slips.',
    btnConfigureWallet: 'Configure Wallet Now',
    addressNotSetBadge: 'Address Not Set',
    quickSetAddressTitle: 'Quick Set Deposit Address',
    quickSetAddressDesc: 'Enter your deposit address for this network to instantly generate QR code:',
    pasteFromClipboard: 'Paste',
    saveAndApply: 'Save & Generate QR',

    // First-Time Setup Wallet Modal
    firstTimeSetupTitle: 'Setup Receiving USDT Address',
    firstTimeSetupSub: 'First-Time Payment Setup',
    firstTimeSetupDesc: 'Please set your USDT receiving address to generate payment slips and deposit QR codes for your clients.',
    firstTimeSetupBtn: 'Save Address & Proceed',
    skipSetupBtn: 'Preview Without Address',
    networkSelectLabel: 'Select USDT Network Protocol',
    inputAddressPlaceholder: 'Paste or enter your USDT receiving address...',

    // Trade History Modal
    historyModalTitle: 'Local Trade Records',
    historyCountSub: 'local transactions logged',
    totalVolume: 'Total Volume',
    totalProfitUsdt: 'Profit (USDT)',
    totalProfitFiat: 'Profit (Fiat)',
    searchPlaceholder: 'Search by amount, note, currency...',
    emptyHistory: 'No Trade Records Found',
    emptyHistorySub: 'Click "Save Record" on the main converter to log OTC transactions locally.',
    exportCsvBtn: 'Export CSV',
    clearHistoryBtn: 'Clear All Records',
    confirmClearHistory: 'Are you sure you want to clear all trade records? This cannot be undone.',
    historyCleared: 'Trade history cleared',
    deleteSingleTrade: 'Delete this record',
    grossUsdtShort: 'USDT Payable',
    costShort: 'Cost',

    // Footer & Common
    footerFormulas: 'Formulas: 1.5 USDT transfer fee + 2%-4% conversion fee + custom profit margin',
    footerTagline: 'Engineered for high-speed P2P OTC merchant settlement on mobile & desktop',
    tradeSavedToast: 'Trade recorded to local history!',
  },

  zh: {
    // App & Header
    appTitle: 'OTC Quota',
    p2pDeskBadge: 'P2P Desk',
    costBaseSub: '成本基准',
    feeSub: '1.5₮/笔 提现费',
    marketRate: '市场价',
    refreshRate: '刷新实时汇率',
    refreshing: '获取中...',
    rateLive: '实时',
    rateCustom: '自定汇率',
    tradeHistoryBtn: '本地流水',
    settingsBtn: '系统设置',

    // Settings Modal
    settingsTitle: '系统设置与偏好 (Settings)',
    settingsSub: '配置语言、日夜主题、USDT 收款钱包与交易台头名称',
    tabGeneral: '常规设置',
    tabWallets: 'USDT 钱包管理',
    languageSectionTitle: '系统语言 (Language)',
    languageSectionDesc: '随时切换全站中英文界面显示',
    langEn: 'English (EN)',
    langZh: '中文 (CN)',
    themeSectionTitle: '界面主题 (Appearance)',
    themeSectionDesc: '切换亮色日间与深色夜间模式，护眼舒适',
    themeLight: '☀️ 亮色模式 (Light)',
    themeDark: '🌙 深色夜间 (Dark)',
    deskNameTitle: 'OTC 商户/台头名称',
    deskNameDesc: '将作为品牌抬头显示在客户付款单据中',
    deskNamePlaceholder: '如：VIP OTC 交易台 / 诚信商户...',
    saveDeskName: '保存台头',
    deskNameSaved: '商户台头已保存',

    // Wallet Management inside Settings
    walletListTitle: '已配置的 USDT 收款钱包',
    walletCount: '个钱包',
    addWalletBtn: '添加钱包',
    defaultBadge: '默认钱包',
    setDefaultBtn: '设为默认',
    editWalletBtn: '修改',
    deleteWalletBtn: '删除',
    copyAddressBtn: '复制地址',
    addressCopied: '已复制地址',
    atLeastOneWallet: '请至少保留一个收款钱包地址。',
    walletDeleted: '钱包已删除',
    defaultWalletSet: '已设为默认收款钱包',
    addNewWalletTitle: '添加新收款钱包',
    editWalletTitle: '修改收款钱包',
    walletNameLabel: '钱包备注名称',
    walletNamePlaceholder: '例如：主收款 TRC20、OKX 交易所备用、币安链...',
    walletNetworkLabel: 'USDT 收款网络类型',
    walletAddressLabel: 'USDT 收款地址',
    walletAddressPlaceholderTRC20: '输入波场 TRC20 地址 (以 T 开头，34 位字符)',
    walletAddressPlaceholderSolana: '输入 Solana 地址 (Base58 格式，32-44 位字符)',
    walletAddressPlaceholderEVM: '输入 EVM 地址 (以 0x 开头，42 位字符)',
    walletMemoLabel: '备注 / Tag / Memo (选填)',
    walletMemoPlaceholder: '如无特殊要求可留空',
    setAsDefaultCheckbox: '设为默认收款钱包',
    setAsDefaultDesc: '生成付款单和客户二维码时将优先使用此钱包',
    cancelBtn: '取消返回',
    saveWalletBtn: '保存钱包',
    walletSavedSuccess: '钱包保存成功！',
    walletAddSuccess: '新钱包添加成功！',
    defaultWalletHint: '生成付款单时会自动使用默认钱包生成二维码与地址。也可在付款单页面临时切换其他网络。',

    // Converter Card
    modeCostToUSDT: '成本 → 收取 USDT 货款',
    modeUSDTToCost: 'USDT 货款 → 覆盖成本',
    costInputLabel: '商品 / 服务成本',
    usdtInputLabel: '收取客户货款 (USDT)',
    clearInputBtn: '清空',
    costPresetsLabel: '常用成本预设',
    usdtPresetsLabel: '常用 USDT 货款预设',
    quickTapHint: '点击秒级载入',
    finalUsdtTitle: '最终收取货款 (USDT)',
    coveredCostTitle: '可覆盖商品/服务成本',
    effectiveRateLabel: '综合折算',
    btnGenerateSlip: '生成收款单 / 二维码',
    btnSaveRecord: '保存流水',
    btnCopyQuota: '复制报价',
    quotaCopied: '已复制到剪贴板！',

    // Fee & Margin Settings
    feeSettingsTitle: '费用与利润参数 (Fee & Margin Parameters)',
    transferFeeShort: '转账费',
    convFeeShort: '兑换费',
    profitShort: '利润',
    collapse: '收起',
    expand: '展开配置',
    walletFeeLabel: '钱包单笔转账手续费 (USDT Fee)',
    walletFeeStd: '1.5 ₮ (标准)',
    convFeeLabel: '市场汇率兑换损耗费率 (2% - 4%)',
    convFeeSub: '当地法币承兑或点对点出金综合成本',
    profitMarginLabel: '商户成本加价利润 (Markup on Cost)',
    profitMarginSub: '按已知商品/服务底金成本直接加价的净利润',
    customRateActive: '已启用固定自定汇率',
    useMarketRate: '使用市场实时汇率',
    marketSpotRate: '市场公允价',

    // Waterfall Breakdown
    breakdownTitle: '透明化报价流水拆解 (Transparent Quota Breakdown)',
    effectiveRateShort: '综合折算',
    netProfitShort: '净利润',
    hideSteps: '收起步骤',
    viewDetails: '查看明细',
    marketBaseRate: '市场基准汇率',
    clientEffectiveRate: '客户综合报价汇率',
    spreadImpact: '点差损益',
    step1Title: '最终收取货款 (Gross USDT)',
    step1Desc: '客户钱包需汇出的完整货款/费用',
    step2Title: '扣除链上转账手续费',
    step2Desc: '钱包/网关单笔扣除',
    step3Title: '净进入兑换池 USDT',
    step3Desc: '实际参与法币汇兑的 USDT 货款本金',
    step4Title: '市场公允法币总值',
    step4Desc: '按实时市价折算 (含兑换损耗前)',
    step5Title: '市场兑换成本扣除',
    step5Desc: '通道出金损耗与点差成本',
    step6Title: '商户成本加价利润 (Cost Markup)',
    step6Desc: '按已知商品/服务底金成本直接加价的纯利润',
    step7Title: '已知商品/服务成本 (Known Cost)',
    step7Desc: '需覆盖的商品或服务采购/服务底金成本',

    // Quick Quote / Payment Slip Modal
    slipModalTitle: '客户收款/报价单 (Payment Slip)',
    slipModalSub: '货款结算与收款二维码',
    totalUsdtPayable: '客户应付货款总额 (Total USDT Payable)',
    costCoverageLabel: '商品/服务成本',
    rateLabel: '折算率',
    selectWalletNetwork: '选择收款钱包 / 网络',
    scanToPay: '扫码支付 USDT',
    addressLabel: '收款地址',
    copyAddrBtn: '复制收款地址',
    copiedAddrBtn: '地址已复制！',
    formattedTextTitle: '格式化文字单据 (可发送至微信/TG/WhatsApp)',
    copyTextSlip: '复制文字报价单',
    textSlipCopied: '文字单据已复制！',
    saveTradeRecord: '保存到本地流水',
    tradeRecorded: '已保存记录！',
    walletConfigBtn: '管理钱包地址',
    noAddressConfigured: '暂未配置收款钱包地址',
    noAddressHint: '请先配置 USDT 收款钱包地址，即可自动生成收款二维码与客户付款单。',
    btnConfigureWallet: '前往配置钱包',
    addressNotSetBadge: '未设置地址',
    quickSetAddressTitle: '快捷填入收款地址',
    quickSetAddressDesc: '输入该网络的收款地址，即可立刻生成二维码与付款单：',
    pasteFromClipboard: '粘贴',
    saveAndApply: '保存并生成二维码',

    // First-Time Setup Wallet Modal
    firstTimeSetupTitle: '设置 USDT 收款地址',
    firstTimeSetupSub: '首次发起收款配置',
    firstTimeSetupDesc: '您尚未设置 USDT 收款地址。请先填入您的收款钱包地址，系统将自动为您生成专属付款单与扫码支付二维码。',
    firstTimeSetupBtn: '保存地址并生成单据',
    skipSetupBtn: '稍后设置 (预览单据)',
    networkSelectLabel: '选择 USDT 收款网络协议',
    inputAddressPlaceholder: '输入或粘贴您的 USDT 收款钱包地址...',

    // Trade History Modal
    historyModalTitle: '本地交易流水 (Trade Records)',
    historyCountSub: '笔本地历史订单',
    totalVolume: '成交总额',
    totalProfitUsdt: '利润 (USDT)',
    totalProfitFiat: '利润 (法币)',
    searchPlaceholder: '搜索金额、备注、币种...',
    emptyHistory: '暂无交易记录',
    emptyHistorySub: '在计算器主界面点击「保存流水」即可记录并汇总随身交易。',
    exportCsvBtn: '导出 CSV',
    clearHistoryBtn: '清空全部流水',
    confirmClearHistory: '确定要清空全部交易记录吗？此操作无法撤销。',
    historyCleared: '交易记录已清空',
    deleteSingleTrade: '删除此条记录',
    grossUsdtShort: '应收货款',
    costShort: '成本',

    // Footer & Common
    footerFormulas: '计费公式: 1.5 USDT 转账费 + 2%-4% 兑换通道费 + 自定义商户净利润',
    footerTagline: '专为移动端与桌面端 OTC P2P 货款结算即时换算设计',
    tradeSavedToast: '已记录到本地交易流水！',
  },
};
