import { Supabase, SupabaseService } from "common-app-module";
import Krew, { KrewSelectQuery } from "../database-interface/Krew.js";

class KrewService extends SupabaseService<Krew> {
  constructor() {
    super("krews", KrewSelectQuery, 50);
  }

  public async fetchOwnedKrews(owner: string) {
    return await this.safeSelect((b) => b.eq("owner", owner));
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
