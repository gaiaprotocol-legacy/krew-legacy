import { ethers } from "https://esm.sh/ethers@6.7.0";
import Contract from "./Contract.ts";
import KrewCommunalArtifact from "./abi/krew/KrewCommunal.json" assert {
  type: "json",
};
import { KrewCommunal } from "./abi/krew/KrewCommunal.ts";

export default class KrewCommunalContract extends Contract<KrewCommunal> {
  public krewCreatedEventFilter: ethers.TopicFilter | undefined;
  public tradeEventFilter: ethers.TopicFilter | undefined;
  public claimHolderFeeEventFilter: ethers.TopicFilter | undefined;

  constructor(signer: ethers.Signer) {
    super(
      Deno.env.get("KREW_COMMUNAL_ADDRESS")!,
      KrewCommunalArtifact.abi,
      signer,
    );
  }

  public async getBuyPrice(krewId: bigint, amount: bigint) {
    return await this.ethersContract.getBuyPrice(krewId, amount);
  }

  public async getBalance(krewId: bigint, walletAddress: string) {
    return (await this.ethersContract.holders(krewId, walletAddress)).balance;
  }

  public async getEvents(startBlock: number, endBlock: number) {
    if (
      !this.krewCreatedEventFilter || !this.tradeEventFilter ||
      !this.claimHolderFeeEventFilter
    ) {
      this.krewCreatedEventFilter = await this.ethersContract.filters
        .KrewCreated()
        .getTopicFilter();
      this.tradeEventFilter = await this.ethersContract.filters.Trade()
        .getTopicFilter();
      this.claimHolderFeeEventFilter = await this.ethersContract.filters
        .ClaimHolderFee().getTopicFilter();
    }

    return await this.ethersContract.queryFilter(
      [this.krewCreatedEventFilter.concat(
        this.tradeEventFilter,
        this.claimHolderFeeEventFilter,
      )] as any,
      startBlock,
      endBlock,
    );
  }
}
