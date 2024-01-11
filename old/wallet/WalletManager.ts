import { EventContainer } from "@common-module/app";
import { ethers } from "ethers";
import ConnectWalletPopup from "./ConnectWalletPopup.js";
import FaceWalletManager from "./FaceWalletManager.js";
import InternalWalletManager from "./InternalWalletManager.js";
import WalletConnectManager from "./WalletConnectManager.js";

const wallets = [FaceWalletManager, WalletConnectManager];

class WalletManager extends EventContainer {
  private internalWallet: (InternalWalletManager & EventContainer) | undefined;

  constructor() {
    super();
    this.addAllowedEvents("accountChanged");
  }

  private async findInternalWallet() {
    await Promise.all(
      wallets.map(async (wallet) => {
        if (await wallet.getAddress()) {
          this.internalWallet = wallet;
        }
      }),
    );
  }

  public async connected() {
    await this.findInternalWallet();
    return await this.internalWallet?.connected() ?? false;
  }

  public async getAddress(): Promise<string> {
    if (this.internalWallet) this.offDelegate(this.internalWallet);

    const addresses = await Promise.all(
      wallets.map(async (wallet) => {
        const address = await wallet.getAddress();
        if (address) this.internalWallet = wallet;
        return address;
      }),
    );

    if (this.internalWallet) {
      this.onDelegate(
        this.internalWallet,
        "accountChanged",
        () => this.fireEvent("accountChanged"),
      );
    }

    const address = addresses.find((address) => !!address);
    if (!address) throw new Error("No wallet connected");
    return address;
  }

  public async getChainId(): Promise<number | undefined> {
    await this.findInternalWallet();
    if (!this.internalWallet) throw new Error("No wallet connected");
    return await this.internalWallet.getChainId();
  }

  public async connect() {
    await new ConnectWalletPopup().wait();
  }

  public async signMessage(message: string): Promise<string> {
    await this.findInternalWallet();
    if (!this.internalWallet) throw new Error("No wallet connected");
    return await this.internalWallet.signMessage(message);
  }

  public async getSigner(): Promise<ethers.providers.JsonRpcSigner> {
    await this.findInternalWallet();
    if (!this.internalWallet) throw new Error("No wallet connected");
    return await this.internalWallet.getSigner();
  }

  public async switchToKroma() {
    await this.findInternalWallet();
    if (!this.internalWallet) throw new Error("No wallet connected");
    await this.internalWallet.switchToKroma();
  }
}

export default new WalletManager();
