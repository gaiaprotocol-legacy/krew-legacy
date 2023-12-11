import { Constants, Supabase, SupabaseService } from "common-app-module";
import Activity, {
  ActivitySelectQuery,
} from "../database-interface/Activity.js";

class ActivityService extends SupabaseService<Activity> {
  constructor() {
    super("activities", ActivitySelectQuery, 100);
  }

  protected enhanceEventData(events: Activity[]): Activity[] {
    const _activities = Supabase.safeResult<Activity[]>(events);
    for (const activity of _activities as any) {
      activity.krew = {
        id: activity.krew_id,
        name: activity.krew_name,
        image: activity.krew_image,
      };
      activity.user = !activity.user_id ? undefined : {
        user_id: activity.user_id,
        display_name: activity.user_display_name,
        profile_image: activity.user_profile_image,
        profile_image_thumbnail: activity.user_profile_image_thumbnail,
        x_username: activity.user_x_username,
      };
    }
    return _activities;
  }

  /*public async fetchGlobalEvents(lastCreatedAt?: string) {
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
  }*/

  public async fetchGlobalActivities(lastCreatedAt?: string) {
    return await this.safeSelect((b) =>
      b.order("created_at", { ascending: false }).gt(
        "created_at",
        lastCreatedAt ?? Constants.UNIX_EPOCH_START_DATE,
      )
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
    return this.enhanceEventData(data);
  }

  public async fetchKrewActivities(
    krew: string,
    lastCreatedAt?: string,
  ) {
    let { data, error } = await Supabase.client.rpc(
      "get_krew_activities",
      {
        p_krew_id: krew,
        last_created_at: lastCreatedAt,
        max_count: this.fetchLimit,
      },
    );
    if (error) throw error;
    if (!data) data = [];
    return this.enhanceEventData(data);
  }
}

export default new ActivityService();
