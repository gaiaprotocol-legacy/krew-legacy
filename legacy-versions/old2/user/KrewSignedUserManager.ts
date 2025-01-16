import { Supabase } from "@common-module/app";
import { SignedUserManager } from "@common-module/social";
import { ethers } from "ethers";
import Env from "../Env.js";
import KrewUserPublic from "../database-interface/KrewUserPublic.js";
import ConnectWalletPopup from "../wallet/ConnectWalletPopup.js";
import UnifiedWalletManager from "../wallet/UnifiedWalletManager.js";
import WalletManager from "../wallet/WalletManager.js";
import KrewUserService from "./KrewUserService.js";

class KrewSignedUserManager extends SignedUserManager<KrewUserPublic> {
  protected async fetchUser(userId: string) {
    return await KrewUserService.fetchUser(userId);
  }

  public get walletLinked() {
    return this.user?.wallet_address !== undefined;
  }

  public async signIn() {
    await Supabase.signIn("twitter");
  }

  public async linkWallet(wallet: WalletManager) {
    if (!await wallet.connected()) {
      if (!await wallet.connect()) throw new Error("Wallet connection failed");
    }

    const walletAddress = await wallet.getAddress();
    if (!walletAddress) throw new Error("Wallet is not connected");

    const { data: nonceData, error: nonceError } = await Supabase.client
      .functions.invoke("new-wallet-linking-nonce", {
        body: { walletAddress },
      });
    if (nonceError) throw nonceError;

    const signedMessage = await wallet.signMessage(
      `${Env.messageForWalletLinking}\n\nNonce: ${nonceData.nonce}`,
    );

    const { error: linkError } = await Supabase.client.functions
      .invoke(
        "link-wallet-to-user",
        { body: { walletAddress, signedMessage } },
      );
    if (linkError) throw linkError;

    if (this.user) {
      this.user.wallet_address = walletAddress;
      this.fireEvent("walletLinked");
    }
  }

  public async getContractSigner(): Promise<ethers.providers.JsonRpcSigner> {
    if (!this.user) throw new Error("User not signed in");
    if (!this.user.wallet_address) throw new Error("Wallet not linked");
    let wallet = await UnifiedWalletManager.findWallet(
      this.user.wallet_address,
      Env.kromaChainId,
    );
    if (!wallet) {
      await new ConnectWalletPopup().wait();
      wallet = await UnifiedWalletManager.findWallet(
        this.user.wallet_address,
        Env.kromaChainId,
      );
      if (!wallet) throw new Error("Wallet not found");
    }
    return await wallet.getSigner();
  }
}

export default new KrewSignedUserManager();
