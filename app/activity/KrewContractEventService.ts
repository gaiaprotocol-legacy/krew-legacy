import { Supabase, SupabaseService } from "common-app-module";
import KrewContractEvent, {
  KrewContractEventSelectQuery,
} from "../database-interface/KrewContractEvent.js";

class KrewContractEventService extends SupabaseService<KrewContractEvent> {
  constructor() {
    super("krew_contract_events", KrewContractEventSelectQuery, 100);
  }

  public async fetchGlobalEvents() {
    return await this.safeSelect((b) =>
      b.in("event_type", [0, 1]).order("block_number", { ascending: false })
        .order("log_index", {
          ascending: false,
        })
    );
  }

  public async fetchKeyHeldEvents(
    walletAddress: string,
    lastCreatedAt?: string,
  ) {
    let { data, error } = await Supabase.client.rpc(
      "get_key_held_krew_contract_events",
      {
        p_wallet_address: walletAddress,
        last_created_at: lastCreatedAt,
        max_count: this.fetchLimit,
      },
    );
    if (error) throw error;
    if (!data) data = [];

    for (const event of data) {
      event.krew = {
        id: event.krew_id,
        name: event.krew_name,
        profile_image_thumbnail: event.krew_profile_image_thumbnail,
      };
    }

    return data ?? [];
  }
}

export default new KrewContractEventService();
