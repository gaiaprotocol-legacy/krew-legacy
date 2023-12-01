import { SupabaseService } from "common-app-module";
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
}

export default new KrewService();
