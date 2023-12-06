import { Supabase } from "common-app-module";
import { SoFiUserPublic, SoFiUserService } from "sofi-module";

class KrewUserService extends SoFiUserService<SoFiUserPublic> {
  constructor() {
    super("users_public", "*", 50);
  }

  public async fetchPortfolioValue(walletAddress: string): Promise<{
    total_keys_count: number;
    total_portfolio_value: bigint;
  }> {
    const { data, error } = await Supabase.client.rpc("get_portfolio_value", {
      p_wallet_address: walletAddress,
    });
    if (error) throw error;
    return {
      total_keys_count: data?.[0]?.total_keys_count ?? 0,
      total_portfolio_value: BigInt(data?.[0]?.total_portfolio_value ?? 0),
    };
  }
}

export default new KrewUserService();
