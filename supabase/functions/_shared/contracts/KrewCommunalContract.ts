import { BigNumber, ethers } from "https://esm.sh/ethers@5.6.8";
import Contract from "./Contract.ts";
import KrewCommunalArtifact from "./abi/krew/KrewCommunal.json" assert {
  type: "json",
};
import { KrewCommunal } from "./abi/krew/KrewCommunal.ts";

export default class KrewCommunalContract extends Contract<KrewCommunal> {
  public krewCreatedEventFilter: ethers.EventFilter | undefined;
  public tradeEventFilter: ethers.EventFilter | undefined;
  public claimHolderFeeEventFilter: ethers.EventFilter | undefined;

  constructor(signer: ethers.Signer) {
    super(
      Deno.env.get("KREW_COMMUNAL_ADDRESS")!,
      KrewCommunalArtifact.abi,
      signer,
    );
  }

  public async getBuyPrice(krewId: BigNumber, amount: BigNumber) {
    return await this.ethersContract.getBuyPrice(krewId, amount);
  }

  public async getBalance(krewId: BigNumber, walletAddress: string) {
    return (await this.ethersContract.holders(krewId, walletAddress)).balance;
  }

  public async getEvents(startBlock: number, endBlock: number) {
    if (
      !this.krewCreatedEventFilter || !this.tradeEventFilter ||
      !this.claimHolderFeeEventFilter
    ) {
      this.krewCreatedEventFilter = this.ethersContract.filters
        .KrewCreated();
      this.tradeEventFilter = this.ethersContract.filters.Trade();
      this.claimHolderFeeEventFilter = this.ethersContract.filters
        .ClaimHolderFee();
    }

    return await this.ethersContract.queryFilter(
      [
        this.krewCreatedEventFilter,
        this.tradeEventFilter,
        this.claimHolderFeeEventFilter,
      ] as any,
      startBlock,
      endBlock,
    );
  }
}
