import { Face, Network } from "@haechi-labs/face-sdk";
import { ethers } from "ethers";
import Env from "../Env.js";
import WalletManager from "./WalletManager.js";

class FaceWalletManager implements WalletManager {
  private face!: Face;
  private provider!: ethers.providers.Web3Provider;

  public init(apiKey: string) {
    this.face = new Face({
      network: Env.dev ? Network.KROMA_SEPOLIA : Network.KROMA,
      apiKey,
    });
    this.provider = new ethers.providers.Web3Provider(
      this.face.getEthLikeProvider(),
    );
  }

  public async connected(): Promise<boolean> {
    return await this.face.auth.isLoggedIn();
  }

  public async connect(): Promise<boolean> {
    const result = await this.face.auth.login();
    return result?.wallet !== undefined;
  }

  public async getAddress(): Promise<string | undefined> {
    try {
      return (await this.provider.listAccounts())[0];
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  public async getChainId(): Promise<number | undefined> {
    const { chainId } = await this.provider.getNetwork();
    return chainId;
  }

  public async signMessage(message: string): Promise<string> {
    return await this.provider.getSigner().signMessage(message);
  }

  public async switchToKroma(): Promise<void> {
    await this.face.switchNetwork(
      Env.dev ? Network.KROMA_SEPOLIA : Network.KROMA,
    );
  }

  public async getSigner(): Promise<ethers.providers.JsonRpcSigner> {
    return this.provider.getSigner();
  }
}

export default new FaceWalletManager();
