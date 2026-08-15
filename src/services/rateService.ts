import { RateData } from '../types';
import { SUPPORTED_CURRENCIES } from '../constants/currencies';

const CACHE_KEY = 'otc_exchange_rates_cache';
const CACHE_DURATION_MS = 60 * 1000; // 1 minute
const REQUEST_TIMEOUT_MS = 4000; // 4s timeout per request
const RATE_LIMIT_RETRY_DELAY_MS = 1000; // 1s backoff retry for HTTP 429

/**
 * Helper to fetch with timeout and single retry on HTTP 429 (Rate Limit).
 * Distinguishes between network/timeout errors and HTTP status errors.
 */
async function fetchWith429Retry(
  url: string,
  serviceName: string,
  timeoutMs: number = REQUEST_TIMEOUT_MS
): Promise<Response | null> {
  const tryFetch = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const resp = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      return resp;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  };

  try {
    const res = await tryFetch();
    if (res.status === 429) {
      console.warn(
        `[ExchangeRate] ${serviceName} received HTTP 429 (Rate Limit). Backing off ${RATE_LIMIT_RETRY_DELAY_MS}ms for retry...`
      );
      await new Promise((r) => setTimeout(r, RATE_LIMIT_RETRY_DELAY_MS));
      try {
        const retryRes = await tryFetch();
        if (!retryRes.ok) {
          console.warn(
            `[ExchangeRate] ${serviceName} retry returned HTTP ${retryRes.status} (${retryRes.statusText})`
          );
          return null;
        }
        return retryRes;
      } catch (retryErr: unknown) {
        const isAbort = (retryErr as { name?: string })?.name === 'AbortError';
        console.warn(
          `[ExchangeRate] ${serviceName} retry failed due to ${
            isAbort ? `timeout (${timeoutMs}ms)` : 'network error'
          }:`,
          retryErr
        );
        return null;
      }
    }

    if (!res.ok) {
      console.warn(
        `[ExchangeRate] ${serviceName} returned HTTP ${res.status} (${res.statusText})`
      );
      return null;
    }

    return res;
  } catch (err: unknown) {
    const isAbort = (err as { name?: string })?.name === 'AbortError';
    console.warn(
      `[ExchangeRate] ${serviceName} fetch failed due to ${
        isAbort ? `timeout (${timeoutMs}ms)` : 'network/offline error'
      }:`,
      err
    );
    return null;
  }
}

export async function fetchLiveExchangeRates(): Promise<Record<string, RateData>> {
  const result: Record<string, RateData> = {};
  const now = new Date().toISOString();

  // Check local cache first
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      const cacheAge = Date.now() - new Date(parsed.timestamp).getTime();
      if (cacheAge < CACHE_DURATION_MS && parsed.rates) {
        return parsed.rates;
      }
    }
  } catch (e) {
    console.warn('[ExchangeRate] Cache read failed:', e);
  }

  // Attempt 1: CoinGecko tether vs currencies
  try {
    const currencyList = SUPPORTED_CURRENCIES.map((c) => c.code.toLowerCase()).join(',');
    const response = await fetchWith429Retry(
      `https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=${currencyList}`,
      'CoinGecko'
    );

    if (response) {
      const data = await response.json();
      if (data && data.tether) {
        SUPPORTED_CURRENCIES.forEach((curr) => {
          const val = data.tether[curr.code.toLowerCase()];
          if (val && typeof val === 'number') {
            result[curr.code] = {
              currencyCode: curr.code,
              rate: val,
              lastUpdated: now,
              source: 'live_coingecko',
              isLive: true,
            };
          }
        });
      }
    }
  } catch (err) {
    console.warn('[ExchangeRate] Error parsing CoinGecko JSON response:', err);
  }

  // Attempt 2: Frankfurter FX API fallback (USD base, since USDT peg ~ 1 USD)
  if (Object.keys(result).length < 3) {
    try {
      const response = await fetchWith429Retry(
        'https://api.frankfurter.app/latest?from=USD',
        'Frankfurter FX'
      );

      if (response) {
        const data = await response.json();
        if (data && data.rates) {
          result['USD'] = {
            currencyCode: 'USD',
            rate: 1.0,
            lastUpdated: now,
            source: 'live_forex',
            isLive: true,
          };

          SUPPORTED_CURRENCIES.forEach((curr) => {
            if (curr.code === 'USD') return;
            const rate = data.rates[curr.code];
            if (rate) {
              result[curr.code] = {
                currencyCode: curr.code,
                rate: Number(rate),
                lastUpdated: now,
                source: 'live_forex',
                isLive: true,
              };
            }
          });
        }
      }
    } catch (err) {
      console.warn('[ExchangeRate] Error parsing Frankfurter JSON response:', err);
    }
  }

  // Fill any missing with default static rates
  SUPPORTED_CURRENCIES.forEach((curr) => {
    if (!result[curr.code]) {
      result[curr.code] = {
        currencyCode: curr.code,
        rate: curr.defaultRateToUSD,
        lastUpdated: now,
        source: 'fallback',
        isLive: false,
      };
    }
  });

  // Save to cache
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        timestamp: now,
        rates: result,
      })
    );
  } catch (e) {
    console.warn('[ExchangeRate] Failed to save rates cache:', e);
  }

  return result;
}

