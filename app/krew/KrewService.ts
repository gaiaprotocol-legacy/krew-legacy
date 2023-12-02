import { Supabase, SupabaseService } from "common-app-module";
import Krew, { KrewSelectQuery } from "../database-interface/Krew.js";

class KrewService extends SupabaseService {
  constructor() {
    super("krews", KrewSelectQuery, 50);
  }

  public async fetchOwnedKrews(owner: string) {
    const data = await this.safeFetch<Krew[]>((b) =>
      b.select(this.selectQuery).eq("owner", owner)
    );
    return data ?? [];
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
}

export default new KrewService();
