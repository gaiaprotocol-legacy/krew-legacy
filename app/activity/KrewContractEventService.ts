import { Supabase, SupabaseService } from "common-app-module";
import KrewContractEvent, {
  KrewContractEventSelectQuery,
} from "../database-interface/KrewContractEvent.js";

class KrewContractEventService extends SupabaseService<KrewContractEvent> {
  constructor() {
    super("krew_contract_events", KrewContractEventSelectQuery, 100);
  }

  protected enhanceEventData(events: KrewContractEvent[]): KrewContractEvent[] {
    const _events = Supabase.safeResult<KrewContractEvent[]>(events);
    for (const event of _events as any) {
      event.krew = {
        id: event.krew_id,
        name: event.krew_name,
        image: event.krew_image,
      };
      event.user = !event.user_id ? undefined : {
        user_id: event.user_id,
        display_name: event.user_display_name,
        profile_image: event.user_profile_image,
        profile_image_thumbnail: event.user_profile_image_thumbnail,
        x_username: event.user_x_username,
      };
    }
    return _events;
  }

  public async fetchGlobalEvents(lastCreatedAt?: string) {
    let { data, error } = await Supabase.client.rpc(
      "get_global_krew_contract_events",
      {
        last_created_at: lastCreatedAt,
        max_count: this.fetchLimit,
      },
    );
    if (error) throw error;
    if (!data) data = [];
    return this.enhanceEventData(data);
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
    return this.enhanceEventData(data);
  }
}

export default new KrewContractEventService();
