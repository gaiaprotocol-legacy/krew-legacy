import { ethers } from "https://esm.sh/ethers@5.6.8";
import KrewCommunalContract from "../_shared/contracts/KrewCommunalContract.ts";
import { serveWithOptions } from "../_shared/cors.ts";
import supabase from "../_shared/supabase.ts";

const provider = new ethers.providers.JsonRpcProvider(
  Deno.env.get("KROMA_RPC")!,
);
const signer = provider.getSigner(ethers.constants.AddressZero);
const contract = new KrewCommunalContract(signer);

serveWithOptions(async () => {
  const { data, error: fetchEventBlockError } = await supabase.from(
    "tracked_event_blocks",
  ).select().eq("contract_type", 1);
  if (fetchEventBlockError) throw fetchEventBlockError;

  let toBlock = (data?.[0]?.block_number ??
    parseInt(Deno.env.get("KREW_COMMUNAL_DEPLOY_BLOCK")!)) + 1000;

  const currentBlock = await provider.getBlockNumber();
  if (toBlock > currentBlock) toBlock = currentBlock;

  const events = await contract.getEvents(toBlock - 2000, toBlock);
  for (const event of events) {
    const eventTopic = event.topics[0];

    let event_type, wallet_address, krew;
    if (eventTopic === contract.krewCreatedEventFilter?.topics?.[0]) {
      event_type = 0;
      krew = "c_" + event.args[0];
      wallet_address = event.args[1];
    } else if (eventTopic === contract.tradeEventFilter?.topics?.[0]) {
      event_type = 1;
      wallet_address = event.args[0];
      krew = "c_" + event.args[1];
    } else if (eventTopic === contract.claimHolderFeeEventFilter?.topics?.[0]) {
      event_type = 2;
      wallet_address = event.args[0];
      krew = "c_" + event.args[1];
    }

    const { error: saveEventError } = await supabase
      .from("krew_contract_events")
      .upsert({
        block_number: event.blockNumber,
        log_index: event.logIndex,
        event_type,
        args: event.args.map((arg: any) => arg.toString()),
        wallet_address,
        krew,
      });
    if (saveEventError) throw saveEventError;
  }

  const { error: saveEventBlockError } = await supabase.from(
    "tracked_event_blocks",
  ).upsert({
    contract_type: 1,
    block_number: toBlock,
    updated_at: new Date().toISOString(),
  });
  if (saveEventBlockError) throw saveEventBlockError;
});
