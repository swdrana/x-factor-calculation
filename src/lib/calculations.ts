export interface ServerCalculation {
  priceInBDT: number;
  monthlyCostBDT: number;
  costPerTB: number;
  costPerGB: number;
  xFactor: number;
}

export interface BaseServer {
  originalPrice: number;
  originalCurrency: 'USD' | 'RMB' | 'BDT';
  duration: number; // in months
  bandwidth: number; // in TB
}

export interface CurrencyRates {
  USD: number;
  RMB: number;
}

// Default exchange rates (fallback)
const DEFAULT_EXCHANGE_RATES: CurrencyRates = {
  USD: 110, // 1 USD = 110 BDT
  RMB: 15,  // 1 RMB = 15 BDT
};

// Default base server for X-factor calculation
const DEFAULT_BASE_SERVER: BaseServer = {
  originalPrice: 1000, // ৳1000
  originalCurrency: 'BDT',
  duration: 1, // 1 month
  bandwidth: 1, // 1TB
};

export function convertToBDT(
  amount: number, 
  currency: 'USD' | 'RMB' | 'BDT', 
  rates?: CurrencyRates
): number {
  if (currency === 'BDT') return amount;
  
  const exchangeRates = rates || DEFAULT_EXCHANGE_RATES;
  return amount * exchangeRates[currency];
}

export function calculateServerCosts(server: BaseServer, rates?: CurrencyRates) {
  const priceInBDT = convertToBDT(server.originalPrice, server.originalCurrency, rates);
  const monthlyCostBDT = priceInBDT / server.duration;
  const costPerTB = monthlyCostBDT / server.bandwidth;
  const costPerGB = costPerTB / 1024;

  return {
    priceInBDT,
    monthlyCostBDT,
    costPerTB,
    costPerGB,
  };
}

export function calculateXFactor(server: BaseServer, baseServer?: BaseServer, rates?: CurrencyRates): number {
  // If this server is the base server, return 1
  if (baseServer && 
      server.originalPrice === baseServer.originalPrice &&
      server.originalCurrency === baseServer.originalCurrency &&
      server.duration === baseServer.duration &&
      server.bandwidth === baseServer.bandwidth) {
    return 1;
  }

  const base = baseServer || DEFAULT_BASE_SERVER;
  
  const serverCosts = calculateServerCosts(server, rates);
  const baseCosts = calculateServerCosts(base, rates);
  
  return serverCosts.costPerGB / baseCosts.costPerGB;
}

export function calculateServerWithXFactor(server: BaseServer, baseServer?: BaseServer, rates?: CurrencyRates) {
  const costs = calculateServerCosts(server, rates);
  const xFactor = calculateXFactor(server, baseServer, rates);
  
  return {
    ...costs,
    xFactor,
  };
}

// Helper function to format BDT currency
export function formatBDT(amount: number): string {
  return `৳${amount.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Helper function to format bandwidth
export function formatBandwidth(tb: number): string {
  if (tb >= 1) {
    return `${tb} TB`;
  } else {
    return `${(tb * 1024).toFixed(0)} GB`;
  }
}