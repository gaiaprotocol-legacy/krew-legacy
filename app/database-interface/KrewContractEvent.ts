export enum EventType {
  KrewCreated,
  Trade,
}

export default interface KrewContractEvent {
  block_number: number;
  log_index: number;
  event_type: EventType;
  args: string;
  wallet_address: string;
  krew: {
    id: string;
    name?: string;
    profile_image_thumbnail?: string;
  };
  created_at: string;
}

export const KrewContractEventSelectQuery =
  "*, krew(id, name, profile_image_thumbnail)";
