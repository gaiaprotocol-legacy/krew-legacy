import { BigNumber } from "ethers";
import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
import Contract from "./Contract.js";
import KrewContract from "./KrewContract.js";
import { KrewCommunal } from "./abi/krew/KrewCommunal.js";
import KrewCommunalArtifact from "./abi/krew/KrewCommunal.json" assert {
  type: "json",
};

class KrewCommunalContract extends Contract<KrewCommunal>
  implements KrewContract {
  constructor() {
    super(KrewCommunalArtifact.abi);
  }

  public async getBuyPrice(krewId: BigNumber, amount: BigNumber) {
    return await this.viewContract.getBuyPrice(krewId, amount);
  }

  public async getSellPrice(krewId: BigNumber, amount: BigNumber) {
    return await this.viewContract.getSellPrice(krewId, amount);
  }

  public async getBuyPriceAfterFee(krewId: BigNumber, amount: BigNumber) {
    return await this.viewContract.getBuyPriceAfterFee(krewId, amount);
  }

  public async getSellPriceAfterFee(krewId: BigNumber, amount: BigNumber) {
    return await this.viewContract.getSellPriceAfterFee(krewId, amount);
  }

  public async getBalance(krewId: BigNumber, walletAddress: string) {
    return (await this.viewContract.holders(krewId, walletAddress)).balance;
  }

  public async getClaimableFee(krewId: BigNumber, walletAddress: string) {
    return await this.viewContract.claimableHolderFee(krewId, walletAddress);
  }

  public async createKrew() {
    const writeContract = await this.getWriteContract();
    const tx = await writeContract.createKrew();
    const receipt = await tx.wait();
    if (!receipt) throw new Error("No receipt");
    if (!KrewSignedUserManager.user) throw new Error("No user");
    const events = await writeContract.queryFilter(
      writeContract.filters.KrewCreated(
        undefined,
        KrewSignedUserManager.user.wallet_address,
      ),
      receipt.blockNumber,
      receipt.blockNumber,
    );
    if (!events || events.length === 0) throw new Error("No events");
    return events[0].args?.[0];
  }

  public async buyKeys(krewId: BigNumber, amount: BigNumber) {
    const writeContract = await this.getWriteContract();
    const tx = await writeContract.buyKeys(krewId, amount, "0x", {
      value: await this.getBuyPriceAfterFee(krewId, amount),
    });
    return tx.wait();
  }

  public async sellKeys(krewId: BigNumber, amount: BigNumber) {
    const writeContract = await this.getWriteContract();
    const tx = await writeContract.sellKeys(krewId, amount, "0x");
    return tx.wait();
  }

  public async claimFee(krewId: BigNumber) {
    const writeContract = await this.getWriteContract();
    const tx = await writeContract.claimHolderFee(krewId);
    return tx.wait();
  }
}

export default new KrewCommunalContract();
