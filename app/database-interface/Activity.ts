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
  "*, krew(id, name, image), user(user_id, display_name, profile_image, profile_image_thumbnail, stored_profile_image, stored_profile_image_thumbnail, x_username)";
