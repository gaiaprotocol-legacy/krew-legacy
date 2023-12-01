import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
import Contract from "./Contract.js";
import { KrewPersonal } from "./abi/krew/KrewPersonal.js";
import KrewPersonalArtifact from "./abi/krew/KrewPersonal.json" assert {
  type: "json",
};

class KrewPersonalContract extends Contract<KrewPersonal> {
  constructor() {
    super(KrewPersonalArtifact.abi);
  }

  public async getBuyPrice(krewId: bigint, amount: bigint) {
    return this.viewContract.getBuyPrice(krewId, amount);
  }

  public async getSellPrice(krewId: bigint, amount: bigint) {
    return this.viewContract.getSellPrice(krewId, amount);
  }

  public async getBuyPriceAfterFee(krewId: bigint, amount: bigint) {
    return this.viewContract.getBuyPriceAfterFee(krewId, amount);
  }

  public async getSellPriceAfterFee(krewId: bigint, amount: bigint) {
    return this.viewContract.getSellPriceAfterFee(krewId, amount);
  }

  public async getBalance(krewId: bigint, walletAddress: string) {
    return this.viewContract.holderBalance(krewId, walletAddress);
  }

  public async createKrew(): Promise<bigint> {
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

  public async buyKeys(krewId: bigint, amount: bigint, value: bigint) {
    const writeContract = await this.getWriteContract();
    const oracleSignature = ""; //TODO: get oracle signature
    const tx = await writeContract.buyKeys(krewId, amount, oracleSignature, {
      value,
    });
    return tx.wait();
  }

  public async sellKeys(krewId: bigint, amount: bigint) {
    const writeContract = await this.getWriteContract();
    const oracleSignature = ""; //TODO: get oracle signature
    const tx = await writeContract.sellKeys(krewId, amount, oracleSignature);
    return tx.wait();
  }
}

export default new KrewPersonalContract();
