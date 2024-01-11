import { EventContainer } from "@common-module/app";
import { Face } from "@haechi-labs/face-sdk";
import { Network } from "@haechi-labs/face-types";
import { ethers } from "ethers";
import Env from "../Env.js";
import InternalWalletManager from "./InternalWalletManager.js";

class FaceWalletManager extends EventContainer
  implements InternalWalletManager {
  private face!: Face;
  private provider!: ethers.providers.Web3Provider;

  public async connected(): Promise<boolean> {
    try {
      return await this.getAddress() !== undefined;
    } catch (e) {
      console.error(e);
      return false;
    }
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

  constructor() {
    super();
    this.addAllowedEvents("accountChanged");
  }

  public init(faceWalletApiKey: string) {
    this.face = new Face({
      network: Env.dev ? Network.KROMA_SEPOLIA : Network.KROMA,
      apiKey: faceWalletApiKey,
    });
    this.provider = new ethers.providers.Web3Provider(
      this.face.getEthLikeProvider(),
    );
  }

  public async connect(): Promise<void> {
    await this.face.auth.login();
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
