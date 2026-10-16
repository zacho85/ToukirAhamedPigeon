import api from "@/lib/axios";

export const getSystemSettings = async () => {
  const res = await api.get('/system-settings');
  console.log("res.data", res.data);
  return res.data;
};

export type FeeQuote = {
  kind: "transfer" | "withdrawal";
  amount: number;
  fee: number;
  total: number;
  /** Transfers only: how much the customer can still send free today. */
  freeLeft?: number;
  freeDailyAmount?: number;
  percent: number;
};

/** The fee the signed-in customer would pay, from the server's own rules. */
export const getFeeQuote = async (kind: "transfer" | "withdrawal", amount: number) => {
  const res = await api.get("/fees/quote", { params: { kind, amount } });
  return res.data as FeeQuote;
};

/** Fees collected minus agent commission paid (can be negative). */
export const getPlatformAccount = async () => {
  const res = await api.get("/fees/platform-account");
  return res.data as { balance: number };
};

export const saveSystemSettings = async (data: any) => {
  const res = await api.post("/system-settings", data);
  return res.data;
};
