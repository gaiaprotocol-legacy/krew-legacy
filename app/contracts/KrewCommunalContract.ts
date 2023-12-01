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
    return tx.wait();
  }
}

export default new KrewCommunalContract();
