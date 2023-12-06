import { ethers } from "https://esm.sh/ethers@6.7.0";
import Contract from "./Contract.ts";
import KrewPersonalArtifact from "./abi/krew/KrewPersonal.json" assert {
  type: "json"
};
import { KrewPersonal } from "./abi/krew/KrewPersonal.ts";

export default class KrewPersonalContract extends Contract<KrewPersonal> {
  public krewCreatedEventFilter: ethers.TopicFilter | undefined;
  public tradeEventFilter: ethers.TopicFilter | undefined;
  public claimKrewFeeEventFilter: ethers.TopicFilter | undefined;

  constructor(signer: ethers.Signer) {
    super(
      Deno.env.get("KREW_PERSONAL_ADDRESS")!,
      KrewPersonalArtifact.abi,
      signer,
    );
  }

  public async getBuyPrice(krewId: bigint, amount: bigint) {
    return await this.ethersContract.getBuyPrice(krewId, amount);
  }

  public async getBalance(krewId: bigint, walletAddress: string) {
    return await this.ethersContract.holderBalance(krewId, walletAddress);
  }

  public async getEvents(startBlock: number, endBlock: number) {
    if (
      !this.krewCreatedEventFilter || !this.tradeEventFilter ||
      !this.claimKrewFeeEventFilter
    ) {
      this.krewCreatedEventFilter = await this.ethersContract.filters
        .KrewCreated()
        .getTopicFilter();
      this.tradeEventFilter = await this.ethersContract.filters.Trade()
        .getTopicFilter();
      this.claimKrewFeeEventFilter = await this.ethersContract.filters
        .ClaimKrewFee().getTopicFilter();
    }

    return await this.ethersContract.queryFilter(
      [this.krewCreatedEventFilter.concat(
        this.tradeEventFilter,
        this.claimKrewFeeEventFilter,
      )] as any,
      startBlock,
      endBlock,
    );
  }
}
