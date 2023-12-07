import {
  Rich,
  Supabase,
  SupabaseService,
  UploadManager,
} from "common-app-module";
import Krew, { KrewSelectQuery } from "../database-interface/Krew.js";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";

class KrewService extends SupabaseService<Krew> {
  constructor() {
    super("krews", KrewSelectQuery, 1000);
  }

  private async uploadKrewImage(file: File): Promise<Rich> {
    const rich: Rich = { files: [] };
    if (KrewSignedUserManager.user) {
      const url = await UploadManager.uploadAttachment(
        "krew_images",
        KrewSignedUserManager.user.user_id,
        file,
        60 * 60 * 24 * 30,
      );
      rich.files?.push({
        url,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });
    }
    return rich;
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
    await this.safeUpdate(data);
  }

  public async fetchNewKrews(lastCreatedAt: string | undefined) {
    return await this.safeSelect((b) =>
      b.order("created_at", { ascending: false }).gt(
        "created_at",
        lastCreatedAt ?? "1970-01-01T00:00:00.000Z",
      )
    );
  }

  public async fetchTopKrews(lastCreatedAt: string | undefined) {
    return await this.safeSelect((b) =>
      b.order("last_fetched_key_price", { ascending: false }).gt(
        "created_at",
        lastCreatedAt ?? "1970-01-01T00:00:00.000Z",
      )
    );
  }

  public async fetchTrendingKrews(lastCreatedAt: string | undefined) {
    return await this.safeSelect((b) =>
      b.order("last_key_purchased_at", { ascending: false }).gt(
        "created_at",
        lastCreatedAt ?? "1970-01-01T00:00:00.000Z",
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

  public async fetchKeyHeldKrews(lastCreatedAt: string | undefined) {
    const { data, error } = await Supabase.client.rpc(
      "get_key_held_krews",
      {
        p_wallet_address: KrewSignedUserManager.user?.wallet_address,
        last_created_at: lastCreatedAt,
        max_count: this.fetchLimit,
      },
    );
    if (error) throw error;
    return Supabase.safeResult<Krew[]>(data ?? []);
  }

  public async findKrews(query: string, lastCreatedAt: string | undefined) {
    return await this.safeSelect((b) =>
      b.or(`name.ilike.%${query}%`).gt(
        "created_at",
        lastCreatedAt ?? "1970-01-01T00:00:00.000Z",
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
