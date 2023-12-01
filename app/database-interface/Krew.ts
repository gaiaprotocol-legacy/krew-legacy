export default interface Krew {
  id: string;
  owner?: string;
  name?: string;
  profile_image?: string;
  profile_image_thumbnail?: string;
  metadata?: {};
  supply: string;
  last_fetched_key_price: string;
  total_trading_key_volume: string;
  total_earned_trading_fees: string;
  is_key_price_up?: boolean;
  last_message?: string;
  last_message_sent_at: string;
  key_holder_count: number;
  last_key_purchased_at: string;
  created_at: string;
  updated_at?: string;
}

export const KrewSelectQuery =
  "*, supply::text, last_fetched_key_price::text, total_trading_key_volume::text, total_earned_trading_fees::text";
