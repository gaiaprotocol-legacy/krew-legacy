import { BigNumber, ethers } from "https://esm.sh/ethers@5.6.8";
import Contract from "./Contract.ts";
import KrewPersonalArtifact from "./abi/krew/KrewPersonal.json" assert {
  type: "json",
};
import { KrewPersonal } from "./abi/krew/KrewPersonal.ts";

export default class KrewPersonalContract extends Contract<KrewPersonal> {
  public krewCreatedEventFilter: ethers.EventFilter | undefined;
  public tradeEventFilter: ethers.EventFilter | undefined;
  public claimKrewFeeEventFilter: ethers.EventFilter | undefined;

  constructor(signer: ethers.Signer) {
    super(
      Deno.env.get("KREW_PERSONAL_ADDRESS")!,
      KrewPersonalArtifact.abi,
      signer,
    );
  }

  public async getBuyPrice(krewId: BigNumber, amount: BigNumber) {
    return await this.ethersContract.getBuyPrice(krewId, amount);
  }

  public async getBalance(krewId: BigNumber, walletAddress: string) {
    return await this.ethersContract.holderBalance(krewId, walletAddress);
  }

  public async getEvents(startBlock: number, endBlock: number) {
    if (
      !this.krewCreatedEventFilter || !this.tradeEventFilter ||
      !this.claimKrewFeeEventFilter
    ) {
      this.krewCreatedEventFilter = this.ethersContract.filters
        .KrewCreated();
      this.tradeEventFilter = this.ethersContract.filters.Trade();
      this.claimKrewFeeEventFilter = this.ethersContract.filters
        .ClaimKrewFee();
    }

    return await this.ethersContract.queryFilter(
      [
        this.krewCreatedEventFilter,
        this.tradeEventFilter,
        this.claimKrewFeeEventFilter,
      ] as any,
      startBlock,
      endBlock,
    );
  }
}
