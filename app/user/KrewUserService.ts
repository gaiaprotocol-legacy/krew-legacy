import { Supabase } from "common-app-module";
import { SoFiUserPublic, SoFiUserService } from "sofi-module";

class KrewUserService extends SoFiUserService<SoFiUserPublic> {
  constructor() {
    super("users_public", "*", 50);
  }

  public async fetchPortfolioValue(walletAddress: string): Promise<bigint> {
    const { data, error } = await Supabase.client.rpc("get_portfolio_value", {
      p_wallet_address: walletAddress,
    });
    if (error) throw error;
    return BigInt(data ?? "0");
  }
}

export default new KrewUserService();
