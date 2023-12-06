import { Supabase, SupabaseService } from "common-app-module";
import Krew, { KrewSelectQuery } from "../database-interface/Krew.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";

class KrewService extends SupabaseService<Krew> {
  constructor() {
    super("krews", KrewSelectQuery, 50);
  }

  public async fetchOwnedKrews(owner: string) {
    return await this.safeSelect((b) => b.eq("owner", owner));
  }

  public async fetchKeyHeldKrews() {
    const { data, error } = await Supabase.client.rpc(
      "get_key_held_krews",
      { p_wallet_address: KrewSignedUserManager.user?.wallet_address },
    );
    if (error) throw error;
    console.log(Supabase.safeResult<Krew[]>(data ?? []));
    return Supabase.safeResult<Krew[]>(data ?? []);
  }

  public async trackPersonalEvents() {
    const { error } = await Supabase.client.functions.invoke(
      "track-krew-personal-events",
    );
    if (error) throw error;
  }

  public async trackCommunalEvents() {
    const { error } = await Supabase.client.functions.invoke(
      "track-krew-communal-events",
    );
    if (error) throw error;
  }

  public async trackKeyPriceAndBalance(krew: string) {
    const { error } = await Supabase.client.functions.invoke(
      "track-key-price-and-balance",
      {
        body: {
          krew,
          walletAddress: KrewSignedUserManager.user?.wallet_address,
        },
      },
    );
    if (error) throw error;
  }
}

export default new KrewService();
