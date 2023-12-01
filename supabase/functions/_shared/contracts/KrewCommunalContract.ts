import { ethers } from "https://esm.sh/ethers@6.7.0";
import Contract from "./Contract.ts";
import KrewCommunalArtifact from "./abi/krew/KrewCommunal.json" assert {
  type: "json"
};
import { KrewCommunal } from "./abi/krew/KrewCommunal.ts";

export default class KrewCommunalContract extends Contract<KrewCommunal> {
  public krewCreatedEventFilter: ethers.TopicFilter | undefined;
  public tradeEventFilter: ethers.TopicFilter | undefined;

  constructor(signer: ethers.Signer) {
    super(
      Deno.env.get("KREW_COMMUNAL_ADDRESS")!,
      KrewCommunalArtifact.abi,
      signer,
    );
  }

  public async getEvents(startBlock: number, endBlock: number) {
    if (!this.krewCreatedEventFilter || !this.tradeEventFilter) {
      this.krewCreatedEventFilter = await this.ethersContract.filters
        .KrewCreated()
        .getTopicFilter();
      this.tradeEventFilter = await this.ethersContract.filters.Trade()
        .getTopicFilter();
    }

    return await this.ethersContract.queryFilter(
      [this.krewCreatedEventFilter.concat(this.tradeEventFilter)] as any,
      startBlock,
      endBlock,
    );
  }
}
