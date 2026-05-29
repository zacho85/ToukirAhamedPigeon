import api from "@/lib/axios";

const EXCHANGE_RATE_API = "https://open.er-api.com/v6/latest";

export async function getExchangeRates(
  baseCurrency: string = "USD"
): Promise<Record<string, number>> {
  try {
    const res = await fetch(`${EXCHANGE_RATE_API}/${baseCurrency}`);
    const data = await res.json();
    if (data.result === "success") {
      return data.rates;
    }
    return {};
  } catch {
    console.error("Failed to fetch exchange rates");
    return {};
  }
}

export async function convertCurrency(
  amount: number,
  from: string,
  to: string = "USD"
): Promise<{ converted: number; rate: number }> {
  const rates = await getExchangeRates(from);
  const rate = rates[to] || 1;
  return { converted: amount * rate, rate };
}