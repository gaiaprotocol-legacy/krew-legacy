import { Face, Network } from "@haechi-labs/face-sdk";
import { ethers } from "ethers";

class FaceWalletManager {
  private face!: Face;
  private provider!: ethers.BrowserProvider;

  public init(apiKey: string) {
    this.face = new Face({
      network: Network.KROMA_SEPOLIA,
      apiKey,
    });
    this.provider = new ethers.BrowserProvider(
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
      return (await this.provider.listAccounts())[0].address;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  public async getChainId(): Promise<number | undefined> {
    const { chainId } = await this.provider.getNetwork();
    return Number(chainId);
  }

  public async signMessage(message: string): Promise<string> {
    return await (await this.provider.getSigner()).signMessage(message);
  }

  public async switchToKroma(): Promise<void> {
    await this.face.switchNetwork(Network.KROMA_SEPOLIA);
  }

  public async getSigner(): Promise<ethers.JsonRpcSigner> {
    return this.provider.getSigner();
  }
}

export default new FaceWalletManager();
