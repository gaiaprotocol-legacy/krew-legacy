import { ethers } from "ethers";

export default interface KrewContract {
  getBuyPrice(krewId: bigint, amount: bigint): Promise<bigint>;
  getSellPrice(krewId: bigint, amount: bigint): Promise<bigint>;
  getBuyPriceAfterFee(krewId: bigint, amount: bigint): Promise<bigint>;
  getSellPriceAfterFee(krewId: bigint, amount: bigint): Promise<bigint>;
  getBalance(krewId: bigint, walletAddress: string): Promise<bigint>;
  getClaimableFee(krewId: bigint, walletAddress: string): Promise<bigint>;
  createKrew(): Promise<bigint>;
  buyKeys(
    krewId: bigint,
    amount: bigint,
  ): Promise<ethers.ContractTransactionReceipt | null>;
  sellKeys(
    krewId: bigint,
    amount: bigint,
  ): Promise<ethers.ContractTransactionReceipt | null>;
  claimFee(krewId: bigint): Promise<ethers.ContractTransactionReceipt | null>;
}
