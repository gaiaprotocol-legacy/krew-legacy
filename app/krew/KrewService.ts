import { Constants, Supabase, SupabaseService, UploadManager } from "common-app-module";
import Krew, { KrewSelectQuery } from "../database-interface/Krew.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";

class KrewService extends SupabaseService<Krew> {
  constructor() {
    super("krews", KrewSelectQuery, 1000);
  }

  public async updateKrew(
    krewId: string,
    name: string,
    description: string,
    krewImage: File | undefined,
  ) {
    const data: Partial<Krew> = {
      id: krewId,
      name,
      metadata: {
        description,
      },
    };
    if (krewImage) {
      data.image = await UploadManager.uploadFile(
        "krew_images",
        krewId,
        krewImage,
      );
    }
    await this.safeUpdate((b) => b.eq("id", krewId), data);
  }

  public async fetchKrew(krewId: string) {
    return await this.safeSelectSingle((b) =>
      b.eq("id", krewId).gt("supply", 0)
    );
  }

  public async fetchNewKrews(lastCreatedAt: string | undefined) {
    return await this.safeSelect((b) =>
      b.gt("supply", 0).order("created_at", { ascending: false }).gt(
        "created_at",
        lastCreatedAt ?? Constants.UNIX_EPOCH_START_DATE,
      )
    );
  }

  public async fetchTopKrews(lastCreatedAt: string | undefined) {
    return await this.safeSelect((b) =>
      b.gt("supply", 0).order("last_fetched_key_price", { ascending: false })
        .gt(
          "created_at",
          lastCreatedAt ?? Constants.UNIX_EPOCH_START_DATE,
        )
    );
  }

  public async fetchTrendingKrews(lastCreatedAt: string | undefined) {
    return await this.safeSelect((b) =>
      b.gt("supply", 0).order("last_key_purchased_at", { ascending: false }).gt(
        "created_at",
        lastCreatedAt ?? Constants.UNIX_EPOCH_START_DATE,
      )
    );
  }

  public async fetchOwnedKrews(
    owner: string,
    lastCreatedAt: string | undefined,
  ) {
    const { data, error } = await Supabase.client.rpc(
      "get_owned_krews",
      {
        p_wallet_address: owner,
        last_created_at: lastCreatedAt,
        max_count: this.fetchLimit,
      },
    );
    if (error) throw error;
    return Supabase.safeResult<Krew[]>(data ?? []);
  }

  public async fetchKeyHeldKrews(
    walletAddress: string,
    lastCreatedAt: string | undefined,
  ) {
    const { data, error } = await Supabase.client.rpc(
      "get_key_held_krews",
      {
        p_wallet_address: walletAddress,
        last_created_at: lastCreatedAt,
        max_count: this.fetchLimit,
      },
    );
    if (error) throw error;
    return Supabase.safeResult<Krew[]>(data ?? []);
  }

  public async findKrews(query: string, lastCreatedAt: string | undefined) {
    return await this.safeSelect((b) =>
      b.gt("supply", 0).or(`name.ilike.%${query}%`).gt(
        "created_at",
        lastCreatedAt ?? Constants.UNIX_EPOCH_START_DATE,
      )
    );
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
