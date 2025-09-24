import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get the form data from the request
    const formData = await request.formData();

    // Create a new FormData to forward to the external API
    const externalFormData = new FormData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    externalFormData.append("file", file);

    // Make the request to the external API with the secure API key and 10-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 seconds

    const response = await fetch(
      "https://whiteprompt.app.n8n.cloud/webhook/76ecec71-15dc-42b0-af4f-b03753b8d27d",
      {
        method: "POST",
        headers: {
          "x-api-key": process.env.N8N_API_KEY!, // Server-side only, no NEXT_PUBLIC_
        },
        body: externalFormData,
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`External API responded with status: ${response.status}`);
    }

    const data = await response.json();

    let exchangeRate = 0;
    const currency = data?.output?.currency;
    if (currency) {
      if (currency === "$") {
        exchangeRate = 1;
      } else {
        try {
          const responseExchangeRate = await fetch(
            "https://api.exchangerate-api.com/v4/latest/USD"
          );

          if (responseExchangeRate.ok) {
            const dataExchangeRate = await responseExchangeRate.json();
            exchangeRate =
              dataExchangeRate.rates[data.output.currency.toUpperCase()];
          }
        } catch (error) {
          console.error("Error extracting exchange rate:", error);
        }
      }
    }

    // Return the extracted data
    return NextResponse.json({
      output: {
        ...data.output,
        exchangeRate,
      },
    });
  } catch (error) {
    console.error("Error extracting receipt data:", error);

    // Handle timeout errors specifically
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        {
          error:
            "Request timed out. Please try again with a smaller file or check your connection.",
        },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { error: "Failed to extract receipt data" },
      { status: 500 }
    );
  }
}
