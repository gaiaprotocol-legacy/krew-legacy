export default interface WalletData {
  wallet_address: string;
  total_key_balance: number;
  total_earned_trading_fees: string;
  created_at: string;
  updated_at?: string;
}

export const WalletDataSelectQuery = "*, total_earned_trading_fees::text";
