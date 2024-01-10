import { ethers } from "ethers";

export default interface InternalWalletManager {
  connected(): Promise<boolean>;
  getAddress(): Promise<string | undefined>;
  getChainId(): Promise<number | undefined>;
  signMessage(message: string): Promise<string>;
  getSigner(): Promise<ethers.providers.JsonRpcSigner>;
  switchToKroma(): Promise<void>;
}
