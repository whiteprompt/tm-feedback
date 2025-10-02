import { NextResponse } from "next/server";
import { exchangeRatesCache } from "@/lib/cache";

interface ExchangeRatesResponse {
  base: string;
  date: string;
  rates: Record<string, number>;
  cached: boolean;
  lastUpdated?: string;
}

export async function GET() {
  try {
    // Try to get cached rates first
    const cachedRates = await exchangeRatesCache.get<ExchangeRatesResponse>();
    if (cachedRates) {
      console.log("[ExchangeRates] Cache hit - returning cached rates");
      return NextResponse.json({
        ...cachedRates,
        cached: true,
      });
    }

    // Cache miss or Redis unavailable - fetch fresh rates
    console.log("[ExchangeRates] Cache miss - fetching fresh rates");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout

    const response = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD",
      {
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(
        `Exchange rate API responded with status: ${response.status}`
      );
    }

    const data = await response.json();

    const exchangeRatesData: ExchangeRatesResponse = {
      base: data.base || "USD",
      date: data.date,
      rates: data.rates || {},
      cached: false,
      lastUpdated: new Date().toISOString(),
    };

    // Cache the fresh data
    await exchangeRatesCache.set(exchangeRatesData);

    return NextResponse.json(exchangeRatesData);
  } catch (error) {
    console.error("Error fetching exchange rates:", error);

    // Handle timeout errors specifically
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        {
          error: "Request timed out. Please try again.",
        },
        { status: 408 }
      );
    }

    // Try to return stale cached data as fallback
    const staleRates = await exchangeRatesCache.get<ExchangeRatesResponse>();
    if (staleRates) {
      console.log(
        "[ExchangeRates] Returning stale cached data due to API error"
      );
      return NextResponse.json({
        ...staleRates,
        cached: true,
        stale: true,
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch exchange rates" },
      { status: 500 }
    );
  }
}
