import KrewSignedUserManager from "../user/KrewSignedUserManager.js";
import Contract from "./Contract.js";
import { KrewCommunal } from "./abi/krew/KrewCommunal.js";
import KrewCommunalArtifact from "./abi/krew/KrewCommunal.json" assert {
  type: "json"
};

class KrewCommunalContract extends Contract<KrewCommunal> {
  constructor() {
    super(KrewCommunalArtifact.abi);
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
}

export default new KrewCommunalContract();
