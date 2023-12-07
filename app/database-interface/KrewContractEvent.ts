import { Author } from "sofi-module";
import PreviewKrew from "./PreviewKrew.js";

export enum EventType {
  KrewCreated,
  Trade,
  ClaimFee,
}

export default interface KrewContractEvent {
  block_number: number;
  log_index: number;
  event_type: EventType;
  args: string;
  wallet_address: string;
  krew: PreviewKrew;
  user?: Author;
  created_at: string;
}

export const KrewContractEventSelectQuery =
  "*, krew(id, name, image_thumbnail)";
