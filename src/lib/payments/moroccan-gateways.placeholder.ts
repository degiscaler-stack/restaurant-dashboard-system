/**
 * Extension point for Moroccan gateways (CMI, Payzone, etc.).
 * Wire a new provider by implementing `createOnlinePaymentSession` and
 * handling webhooks in `src/app/api/webhooks/<provider>/route.ts`.
 */
export type MoroccanGatewayId = "CMI" | "PAYZONE";

export interface MoroccanPaymentSessionRequest {
  orderNumber: string;
  amountMad: string;
  returnUrl: string;
  cancelUrl: string;
}

export async function createMoroccanPaymentSession(
  gateway: MoroccanGatewayId,
  req: MoroccanPaymentSessionRequest,
): Promise<never> {
  void gateway;
  void req;
  throw new Error("Moroccan gateway not configured");
}
