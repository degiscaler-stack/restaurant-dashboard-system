type PayPalAccessToken = { access_token: string };

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) {
    throw new Error("PayPal credentials are not configured");
  }
  const base =
    process.env.PAYPAL_MODE === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";
  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");
  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`PayPal auth failed: ${t}`);
  }
  const data = (await res.json()) as PayPalAccessToken;
  return data.access_token;
}

function apiBase() {
  return process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export async function paypalCreateOrder(params: {
  orderNumber: string;
  amountMad: string;
  currency?: string;
  cancelPath?: string;
}) {
  const token = await getAccessToken();
  const currency = params.currency ?? "MAD";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";
  const cancelUrl =
    params.cancelPath ??
    `${baseUrl}/payment/failed?orderNumber=${encodeURIComponent(params.orderNumber)}`;

  const body = {
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: params.orderNumber,
        custom_id: params.orderNumber,
        invoice_id: params.orderNumber,
        amount: {
          currency_code: currency,
          value: params.amountMad,
        },
      },
    ],
    application_context: {
      brand_name: "Le Grand Baraka Grill",
      locale: "ar-MA",
      landing_page: "NO_PREFERENCE",
      user_action: "PAY_NOW",
      return_url: `${baseUrl}/payment/paypal-return`,
      cancel_url: cancelUrl,
    },
  };

  const res = await fetch(`${apiBase()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`PayPal create order failed: ${raw}`);
  }
  const data = JSON.parse(raw) as {
    id: string;
    links?: { href: string; rel: string; method?: string }[];
  };
  const approve = data.links?.find((l) => l.rel === "approve")?.href;
  if (!approve) throw new Error("PayPal approve link missing");
  return { paypalOrderId: data.id, approvalUrl: approve, raw };
}

export async function paypalCaptureOrder(paypalOrderId: string) {
  const token = await getAccessToken();
  const res = await fetch(
    `${apiBase()}/v2/checkout/orders/${paypalOrderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    },
  );
  const raw = await res.text();
  const ok = res.ok;
  let data: unknown = null;
  try {
    data = JSON.parse(raw);
  } catch {
    data = raw;
  }
  return { ok, status: res.status, data, raw };
}
