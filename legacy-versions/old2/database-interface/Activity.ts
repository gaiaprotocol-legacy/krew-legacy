import { Author } from "@common-module/social";
import PreviewKrew from "./PreviewKrew.js";

export enum EventType {
  KrewCreated,
  Trade,
}

export default interface Activity {
  block_number: number;
  event_type: EventType;
  args: string;
  wallet_address: string;
  krew: PreviewKrew;
  user?: Author;
  created_at: string;
}

export const ActivitySelectQuery =
  "*, krew(id, name, image), user(user_id, display_name, avatar, avatar_thumb, stored_avatar, stored_avatar_thumb, x_username)";
