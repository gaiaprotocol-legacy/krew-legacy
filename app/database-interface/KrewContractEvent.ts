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
  krew: string;
  created_at: string;
}
