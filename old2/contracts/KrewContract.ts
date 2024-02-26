import { BigNumber, ethers } from "ethers";

export default interface KrewContract {
  getBuyPrice(krewId: BigNumber, amount: BigNumber): Promise<BigNumber>;
  getSellPrice(krewId: BigNumber, amount: BigNumber): Promise<BigNumber>;
  getBuyPriceAfterFee(krewId: BigNumber, amount: BigNumber): Promise<BigNumber>;
  getSellPriceAfterFee(
    krewId: BigNumber,
    amount: BigNumber,
  ): Promise<BigNumber>;
  getBalance(krewId: BigNumber, walletAddress: string): Promise<BigNumber>;
  getClaimableFee(krewId: BigNumber, walletAddress: string): Promise<BigNumber>;
  createKrew(): Promise<BigNumber>;
  buyKeys(
    krewId: BigNumber,
    amount: BigNumber,
  ): Promise<ethers.ContractReceipt | null>;
  sellKeys(
    krewId: BigNumber,
    amount: BigNumber,
  ): Promise<ethers.ContractReceipt | null>;
  claimFee(
    krewId: BigNumber,
  ): Promise<ethers.ContractReceipt | null>;
}
