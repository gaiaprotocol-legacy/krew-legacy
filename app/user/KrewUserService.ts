import { Supabase } from "@common-module/app";
import { SoFiUserService } from "@common-module/social";
import KrewUserPublic from "../database-interface/KrewUserPublic.js";

class KrewUserService extends SoFiUserService<KrewUserPublic> {
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

  public async fetchKrewHolders(
    krew: string,
    lastCreatedAt?: string,
  ): Promise<KrewUserPublic[]> {
    const { data, error } = await Supabase.client.rpc("get_krew_holders", {
      p_krew_id: krew,
      last_created_at: lastCreatedAt,
      max_count: this.fetchLimit,
    });
    if (error) throw error;
    return data;
  }
}

export default new KrewUserService();
