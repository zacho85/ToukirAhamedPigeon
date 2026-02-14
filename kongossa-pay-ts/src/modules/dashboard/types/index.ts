export interface DashboardUser {
  id: number | string;
  fullName?: string;
  email?: string;
  profile_image?: string;
  wallet_balance?: number;
  rewards_points?: number;
  currency?: string;
}

export interface Transaction {
  id?: number;
  sender_id?: string;
  recipient_id?: string;
  amount?: number;
  type?: "send" | "receive" | "deposit" | "withdraw";
  description?: string;
  created_at?: string;
}
