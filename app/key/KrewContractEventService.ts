import { SupabaseService } from "common-app-module";
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
}

export default new KrewContractEventService();
