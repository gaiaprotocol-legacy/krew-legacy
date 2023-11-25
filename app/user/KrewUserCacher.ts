import { TempSoFiUserCacher } from "sofi-module";
import SoFiUserPublic from "sofi-module/lib/database-interface/SoFiUserPublic.js";

class KrewUserCacher extends TempSoFiUserCacher<SoFiUserPublic> {
  private keyHoldingCountMap = new Map<string, number>();
  private portfolioValueMap = new Map<string, bigint>();

  public cacheKeyHoldingCount(userId: string, count: number) {
    this.keyHoldingCountMap.set(userId, count);
  }

  public getKeyHoldingCount(userId: string): number | undefined {
    return this.keyHoldingCountMap.get(userId);
  }

  public cachePortfolioValue(userId: string, value: bigint) {
    this.portfolioValueMap.set(userId, value);
  }

  public getPortfolioValue(userId: string): bigint | undefined {
    return this.portfolioValueMap.get(userId);
  }
}

export default new KrewUserCacher();
