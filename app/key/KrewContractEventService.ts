import { Supabase, SupabaseService } from "common-app-module";
import KrewContractEvent from "../database-interface/KrewContractEvent.js";

class KrewContractEventService extends SupabaseService {
  constructor() {
    super("krew_contract_events", "*", 100);
  }

  public async fetchGlobalEvents() {
    const data = await this.safeFetch<KrewContractEvent[]>((b) =>
      b.select(this.selectQuery).order(
        "block_number",
        { ascending: false },
      ).order(
        "log_index",
        { ascending: false },
      )
    );
    return data ?? [];
  }

  public async fetchKeyHeldEvents(
    walletAddress: string,
    lastCreatedAt?: string,
  ) {
    const { data, error } = await Supabase.client.rpc("get_key_held_krew_contract_events", {
      p_wallet_address: walletAddress,
      last_created_at: lastCreatedAt,
      max_count: this.fetchLimit,
    });
    if (error) throw error;
    return data ?? [];
  }
}

export default new KrewContractEventService();
