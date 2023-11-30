import Contract from "./Contract.js";
import { KrewCommunal } from "./abi/krew/KrewCommunal.js";
import KrewCommunalArtifact from "./abi/krew/KrewCommunal.json" assert {
  type: "json",
};

class KrewCommunalContract extends Contract<KrewCommunal> {
  constructor() {
    super(KrewCommunalArtifact.abi);
  }
}

export default new KrewCommunalContract();
