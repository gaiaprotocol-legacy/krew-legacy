import { ethers } from "ethers";
import Env from "./Env.js";

class BlockTimeManager {
  private blockNumber!: number;
  private blockTime!: number;

  public async init() {
    const provider = new ethers.providers.JsonRpcProvider(
      Env.kromaRpc,
    );
    const block = await provider.getBlock("latest");
    this.blockNumber = block!.number;
    this.blockTime = block!.timestamp * 1000;
  }

  public blockToTime(blockNumber: number): number {
    // kroma chain (2s block time)
    return this.blockTime + (blockNumber - this.blockNumber) * 2 * 1000;
  }
}

export default new BlockTimeManager();
