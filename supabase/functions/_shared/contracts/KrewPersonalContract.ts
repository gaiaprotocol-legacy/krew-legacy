import { ethers } from "https://esm.sh/ethers@6.7.0";
import Contract from "./Contract.ts";
import KrewPersonalArtifact from "./abi/krew/KrewPersonal.json" assert {
  type: "json",
};
import { KrewPersonal } from "./abi/krew/KrewPersonal.ts";

export default class KrewPersonalContract extends Contract<KrewPersonal> {
  public krewCreatedEventFilter: ethers.TopicFilter | undefined;
  public tradeEventFilter: ethers.TopicFilter | undefined;

  constructor(signer: ethers.Signer) {
    super(
      Deno.env.get("KREW_PERSONAL_ADDRESS")!,
      KrewPersonalArtifact.abi,
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
